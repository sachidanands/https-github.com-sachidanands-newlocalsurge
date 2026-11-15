import type { FrontdeskLead, FrontdeskSite } from "../../src/types/frontdesk";
import { assertSafePublicUrl } from "./frontdesk-crawler";
import { dispatchLeadEmail } from "./frontdesk-dispatch";

export interface EndpointDeliveryResult {
  ok: boolean;
  statusCode?: number;
  attempts: number;
  error?: string;
}

export interface LeadDeliveryResult {
  email: {
    ok: boolean;
    id?: string;
    skipped?: boolean;
    error?: string;
  };
  endpoint?: EndpointDeliveryResult;
}

const DISALLOWED_HEADER_NAMES = new Set([
  "host",
  "content-length",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "cookie",
  "set-cookie"
]);

function buildMappedPayload(
  lead: FrontdeskLead,
  site: FrontdeskSite,
  fieldMap?: Record<string, string>
): Record<string, string> {
  const map = fieldMap || {};
  const mapKey = (logicalKey: string, fallback: string) => {
    const custom = map[logicalKey];
    return custom && typeof custom === "string" && custom.trim() ? custom.trim().slice(0, 60) : fallback;
  };

  const payload: Record<string, string> = {};
  payload[mapKey("name", "name")] = lead.customer_name || "Website Visitor";
  payload[mapKey("email", "email")] = lead.customer_email || "";
  payload[mapKey("phone", "phone")] = lead.customer_phone || "";
  payload[mapKey("message", "message")] = lead.issue_description || "";
  payload[mapKey("sourceUrl", "source_url")] = site.website_url || "";
  payload.site_id = site.id;
  payload.lead_id = lead.id;
  payload.created_at = lead.created_at;
  return payload;
}

export async function deliverLeadToEndpoint(
  lead: FrontdeskLead,
  site: FrontdeskSite,
  retryDelaysMs = [400, 1200]
): Promise<EndpointDeliveryResult> {
  const ep = site.lead_delivery?.endpoint;
  if (!ep?.url) {
    return { ok: false, attempts: 0, error: "Endpoint URL is not configured." };
  }

  const isSafe = await assertSafePublicUrl(ep.url);
  if (!isSafe) {
    return {
      ok: false,
      attempts: 0,
      error: "Endpoint URL failed SSRF validation (must be a public HTTP/HTTPS URL)."
    };
  }

  const mapped = buildMappedPayload(lead, site, ep.field_map);
  const format = ep.format === "form" ? "form" : "json";

  const headers: Record<string, string> = {
    "User-Agent": "LocalSurge-FrontDesk-Webhook/2.0"
  };

  if (ep.headers && typeof ep.headers === "object") {
    for (const [rawKey, rawVal] of Object.entries(ep.headers).slice(0, 10)) {
      const k = String(rawKey).trim();
      if (!k || !/^[a-zA-Z0-9-]+$/.test(k) || DISALLOWED_HEADER_NAMES.has(k.toLowerCase())) {
        continue;
      }
      headers[k] = String(rawVal || "").replace(/[\r\n]+/g, " ").slice(0, 500);
    }
  }

  let body: string;
  if (format === "form") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(mapped).toString();
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(mapped);
  }

  const maxAttempts = 3;
  let lastError = "Unknown endpoint delivery error";
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await fetch(ep.url, {
        method: "POST",
        headers,
        body,
        redirect: "manual",
        signal: AbortSignal.timeout(5000)
      });
      lastStatus = resp.status;
      if (resp.ok) {
        return { ok: true, statusCode: resp.status, attempts: attempt };
      }
      lastError = `Endpoint returned HTTP ${resp.status}`;
    } catch (err: any) {
      lastError = err?.message || "Network timeout";
    }

    if (attempt < maxAttempts) {
      const delayMs = retryDelaysMs[attempt - 1] ?? 1000;
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return {
    ok: false,
    statusCode: lastStatus,
    attempts: maxAttempts,
    error: lastError
  };
}

export async function deliverLeadToConfiguredChannels(
  lead: FrontdeskLead,
  site: FrontdeskSite,
  resendGetter: () => Promise<any>
): Promise<LeadDeliveryResult> {
  // Always ensure notification email goes out for dashboard leads
  const emailSiteCopy: FrontdeskSite = {
    ...site,
    feature_flags: {
      enablePhotoUpload: site.feature_flags?.enablePhotoUpload ?? false,
      enableEmailDispatch: true,
      enableSmsDispatch: site.feature_flags?.enableSmsDispatch ?? false,
      enablePhoneCallback: site.feature_flags?.enablePhoneCallback ?? false,
      enableEmergencyBanner: site.feature_flags?.enableEmergencyBanner ?? false,
      enableDirectBooking: site.feature_flags?.enableDirectBooking ?? false,
      enableCustomBranding: site.feature_flags?.enableCustomBranding ?? true,
      planTier: site.feature_flags?.planTier || "trial"
    }
  };

  let emailResult: LeadDeliveryResult["email"] = { ok: false, error: "Not dispatched" };
  try {
    const res = await dispatchLeadEmail(lead, emailSiteCopy, resendGetter);
    emailResult = {
      ok: Boolean(res.success),
      id: res.id,
      skipped: res.skipped,
      error: res.error
    };
  } catch (err: any) {
    emailResult = { ok: false, error: err?.message || "Email dispatch failed" };
  }

  const mode = site.lead_delivery?.mode || "email";
  let endpointResult: EndpointDeliveryResult | undefined;
  if (mode === "endpoint" && site.lead_delivery?.endpoint?.url) {
    endpointResult = await deliverLeadToEndpoint(lead, site);
  }

  return {
    email: emailResult,
    ...(endpointResult ? { endpoint: endpointResult } : {})
  };
}

export async function sendTestLeadDelivery(
  site: FrontdeskSite,
  resendGetter: () => Promise<any>
): Promise<LeadDeliveryResult> {
  const sampleLead: FrontdeskLead = {
    id: `flead_test_${Date.now().toString(36)}`,
    site_id: site.id,
    created_at: new Date().toISOString(),
    status: "new",
    urgency: "standard",
    customer_name: "Alex Taylor (Test Lead)",
    customer_phone: "(555) 014-8920",
    customer_email: "test-visitor@example.com",
    service_address: "Test Website Visitor",
    issue_description: "Sample test lead sent from your AI FrontDesk dashboard to verify lead delivery.",
    transcript: [
      { role: "assistant", content: site.widget_config?.greeting || "Hi! How can we help?" },
      { role: "user", content: "Hi, I'd like to test how leads arrive from the chatbot." }
    ],
    qualification_summary: {
      urgencyScore: 50,
      isInsideServiceArea: true,
      actionRequired: "Test Verification Only"
    },
    dispatched_at: new Date().toISOString(),
    dispatch_channel: site.lead_delivery?.mode || "email"
  };

  return deliverLeadToConfiguredChannels(sampleLead, site, resendGetter);
}
