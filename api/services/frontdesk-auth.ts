import crypto from "crypto";
import type express from "express";
import type { FrontdeskSite } from "../../src/types/frontdesk";

export const FRONTDESK_SESSION_COOKIE = "fd_session";
const MAGIC_LINK_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Bounded in-memory replay guard for one-time magic tokens in the current runtime
const consumedMagicNonces = new Map<string, number>();

function pruneConsumedNonces() {
  const now = Date.now();
  if (consumedMagicNonces.size < 2000) {
    for (const [nonce, exp] of consumedMagicNonces.entries()) {
      if (exp < now) consumedMagicNonces.delete(nonce);
    }
    return;
  }
  consumedMagicNonces.clear();
}

export function getFrontdeskAuthSecret(): string {
  if (process.env.FRONTDESK_AUTH_SECRET) return process.env.FRONTDESK_AUTH_SECRET;
  if (process.env.ADMIN_TOKEN_SECRET) return process.env.ADMIN_TOKEN_SECRET;
  const seed = `${process.env.ADMIN_PASSWORD || ""}:${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}:${process.env.CLOUDFLARE_ORIGIN_SECRET || "local_dev_frontdesk"}`;
  return crypto.createHmac("sha256", "localsurge_frontdesk_portal_v2").update(seed).digest("hex");
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getPublicAppBaseUrl(req?: express.Request): string {
  const configured = (process.env.APP_URL || "https://localsurgeseo.com").replace(/\/+$/, "");
  if (req && process.env.NODE_ENV !== "production") {
    const host = String(req.headers.host || "").toLowerCase();
    if (host.startsWith("localhost:") || host.startsWith("127.0.0.1:")) {
      const proto = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      return `${proto}://${host}`;
    }
  }
  return configured;
}

function signBase64Payload(payloadObj: Record<string, unknown>, purpose: string): string {
  const encoded = Buffer.from(JSON.stringify(payloadObj), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getFrontdeskAuthSecret())
    .update(`${purpose}:${encoded}`)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

function verifyBase64Payload<T extends Record<string, any>>(token: string, purpose: string): T | null {
  if (!token || typeof token !== "string") return null;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return null;
  const encoded = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getFrontdeskAuthSecret())
    .update(`${purpose}:${encoded}`)
    .digest("base64url");

  if (!safeEqualStrings(sig, expectedSig)) return null;

  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as T;
    if (!parsed || typeof parsed.exp !== "number" || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export interface MagicLoginTokenResult {
  token: string;
  url: string;
  expiresAt: string;
}

export function issueMagicLoginToken(email: string, siteId?: string, req?: express.Request): MagicLoginTokenResult {
  const normalizedEmail = String(email).trim().toLowerCase();
  const exp = Date.now() + MAGIC_LINK_TTL_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const token = signBase64Payload(
    { email: normalizedEmail, siteId: siteId || undefined, exp, nonce },
    "magic_login_v2"
  );
  const baseUrl = getPublicAppBaseUrl(req);
  const siteQuery = siteId ? `&siteId=${encodeURIComponent(siteId)}` : "";
  return {
    token,
    url: `${baseUrl}/ai-frontdesk/dashboard?token=${encodeURIComponent(token)}${siteQuery}`,
    expiresAt: new Date(exp).toISOString()
  };
}

export function verifyAndConsumeMagicLoginToken(
  token: string
): { valid: true; email: string; siteId?: string } | { valid: false; error: string } {
  const payload = verifyBase64Payload<{ email: string; siteId?: string; exp: number; nonce: string }>(
    token,
    "magic_login_v2"
  );
  if (!payload || !payload.email || !payload.nonce) {
    return { valid: false, error: "This login link is invalid or has expired. Please request a new link." };
  }

  pruneConsumedNonces();
  if (consumedMagicNonces.has(payload.nonce)) {
    return { valid: false, error: "This login link has already been used. Please request a fresh link." };
  }
  consumedMagicNonces.set(payload.nonce, payload.exp);

  return {
    valid: true,
    email: String(payload.email).trim().toLowerCase(),
    siteId: payload.siteId ? String(payload.siteId) : undefined
  };
}

export function createSessionCookieValue(email: string): string {
  const normalizedEmail = String(email).trim().toLowerCase();
  return signBase64Payload(
    { email: normalizedEmail, exp: Date.now() + SESSION_TTL_MS, v: 1 },
    "portal_session_v2"
  );
}

export function parseCookies(req: express.Request): Record<string, string> {
  const raw = req.headers.cookie;
  if (!raw || typeof raw !== "string") return {};
  const result: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx <= 0) continue;
    const key = part.slice(0, eqIdx).trim();
    const val = part.slice(eqIdx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

export function getSessionEmailFromRequest(req: express.Request): string | null {
  const cookies = parseCookies(req);
  const rawSession = cookies[FRONTDESK_SESSION_COOKIE];
  if (!rawSession) return null;
  const payload = verifyBase64Payload<{ email: string; exp: number; v: number }>(
    rawSession,
    "portal_session_v2"
  );
  if (!payload || !payload.email) return null;
  return String(payload.email).trim().toLowerCase();
}

export function setPortalSessionCookie(res: express.Response, email: string, req?: express.Request): void {
  const value = encodeURIComponent(createSessionCookieValue(email));
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const isProdHttps =
    process.env.NODE_ENV === "production" ||
    req?.headers["x-forwarded-proto"] === "https";
  const parts = [
    `${FRONTDESK_SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`
  ];
  if (isProdHttps) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearPortalSessionCookie(res: express.Response, req?: express.Request): void {
  const isProdHttps =
    process.env.NODE_ENV === "production" ||
    req?.headers["x-forwarded-proto"] === "https";
  const parts = [
    `${FRONTDESK_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];
  if (isProdHttps) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function userOwnsSite(site: Pick<FrontdeskSite, "contact_email"> | null | undefined, sessionEmail: string): boolean {
  if (!site?.contact_email || !sessionEmail) return false;
  return site.contact_email.trim().toLowerCase() === sessionEmail.trim().toLowerCase();
}
