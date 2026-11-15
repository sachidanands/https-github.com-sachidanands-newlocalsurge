import express from "express";
import type {
  FrontdeskLead,
  FrontdeskSite,
  LeadDeliveryConfig,
  PortalSite,
  SiteSubscription,
  SubscriptionStatus
} from "../../src/types/frontdesk";
import {
  clearPortalSessionCookie,
  getPublicAppBaseUrl,
  getSessionEmailFromRequest,
  issueMagicLoginToken,
  setPortalSessionCookie,
  userOwnsSite,
  verifyAndConsumeMagicLoginToken
} from "./frontdesk-auth";
import { getFrontdeskAnalytics, recordFrontdeskEvent } from "./frontdesk-analytics";
import { assertSafePublicUrl, crawlSiteKnowledge } from "./frontdesk-crawler";
import {
  sendMagicLinkEmail,
  sendPaymentFailedEmail,
  sendSaasWelcomeEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCanceledEmail,
  sendTrialCountdownEmail,
  sendTrialPausedEmail,
  sendWeeklyDigestEmail
} from "./frontdesk-emails";
import { deliverLeadToConfiguredChannels, sendTestLeadDelivery } from "./frontdesk-lead-delivery";
import {
  billingConfigured,
  cancelPaypalSubscription,
  createPaypalSubscription,
  getPaypalConfig,
  getPaypalSubscription,
  verifyPaypalWebhookSignature
} from "./paypal";

export interface FrontdeskSaasDeps {
  getSupabase: () => Promise<any>;
  getResend: () => Promise<any>;
  getGemini: () => Promise<any>;
  readFrontdeskSites: () => FrontdeskSite[];
  writeFrontdeskSites: (sites: FrontdeskSite[]) => void;
  readFrontdeskLeads: () => FrontdeskLead[];
  writeFrontdeskLeads: (leads: FrontdeskLead[]) => void;
  serializeSiteForSupabase: (site: FrontdeskSite) => any;
  hydrateFrontdeskSite: (row: any) => FrontdeskSite;
  requireAdmin: express.RequestHandler;
  isAdminRequest: (req: express.Request) => boolean;
  processLeadSubmission: (rawInput: Record<string, any>, options?: Record<string, any>) => Promise<any>;
  isRateLimited?: (ip: string) => boolean;
  getClientIp: (req: express.Request) => string;
}

const magicLinkRateMap = new Map<string, { count: number; resetAt: number }>();

function isMagicLinkRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 12;
  const existing = magicLinkRateMap.get(ip);
  if (!existing || now > existing.resetAt) {
    if (magicLinkRateMap.size >= 2000) {
      magicLinkRateMap.clear();
    }
    magicLinkRateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (existing.count >= maxRequests) return true;
  existing.count++;
  return false;
}

const VALID_ICON_PRESETS = new Set([
  "chat",
  "headset",
  "sparkles",
  "message",
  "wrench",
  "heart",
  "shield",
  "bolt"
]);

export const FRONTDESK_PRICE_USD = 5;

export function normalizeRootHost(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  let host = input.trim().toLowerCase();
  try {
    if (host.includes("://")) {
      host = new URL(host).hostname.toLowerCase();
    } else {
      host = host.split("/")[0].split(":")[0].toLowerCase();
    }
  } catch {
    host = host.split("/")[0].split(":")[0].toLowerCase();
  }
  return host.replace(/^www\./, "");
}

export function normalizeSiteDefaults(raw: FrontdeskSite): FrontdeskSite {
  const site: FrontdeskSite = { ...raw };

  // Detect built-in/internal sample sites created without trial owner email
  const isInternal =
    site.is_internal === true ||
    site.id === "site_localsurge" ||
    (!site.is_trial && !site.contact_email && !site.subscription?.paypal_subscription_id);

  site.is_internal = isInternal;
  site.enabled = site.enabled !== false;
  site.is_comped = Boolean(site.is_comped);
  site.emails_sent = site.emails_sent && typeof site.emails_sent === "object" ? { ...site.emails_sent } : {};

  if (!site.subscription || !site.subscription.status) {
    let status: SubscriptionStatus = "trialing";
    if (isInternal) status = "internal";
    else if (site.is_comped) status = "comped";
    else if (site.status === "soft_locked" || site.status === "paused") status = "paused";
    else if (site.status === "grace_period") status = "grace";
    else if (!site.is_trial && site.contact_email) status = "active";

    site.subscription = {
      status,
      provider: status === "active" ? "paypal" : null
    };
  }

  if (!site.lead_delivery || !site.lead_delivery.mode) {
    site.lead_delivery = {
      mode: "email",
      notify_email: site.contact_email || undefined
    };
  } else if (!site.lead_delivery.notify_email && site.contact_email) {
    site.lead_delivery = {
      ...site.lead_delivery,
      notify_email: site.contact_email
    };
  }

  site.widget_config = {
    themeColor: site.widget_config?.themeColor || "#123e35",
    greeting: site.widget_config?.greeting || `Hi! How can we help you at ${site.business_name} today?`,
    speedToLeadCity: site.widget_config?.speedToLeadCity || site.service_radius?.city || "Local Area",
    quickChips: Array.isArray(site.widget_config?.quickChips) && site.widget_config.quickChips.length > 0
      ? site.widget_config.quickChips
      : ["Our services", "Get an estimate", "Contact us"],
    position: site.widget_config?.position === "left" ? "left" : "right",
    assistantName: site.widget_config?.assistantName || "AI Assistant",
    iconPreset: site.widget_config?.iconPreset || "chat",
    iconUrl: site.widget_config?.iconUrl || undefined,
    showPoweredBy: site.widget_config?.showPoweredBy !== false
  };

  return site;
}

export async function listAllSites(deps: FrontdeskSaasDeps): Promise<FrontdeskSite[]> {
  const byId = new Map<string, FrontdeskSite>();
  const localSites = deps.readFrontdeskSites();
  for (const s of localSites) {
    if (s?.id) byId.set(s.id, normalizeSiteDefaults(s));
  }

  const supabase = await deps.getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("frontdesk_sites")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const hydrated = normalizeSiteDefaults(deps.hydrateFrontdeskSite(row));
          byId.set(hydrated.id, hydrated);
        }
      }
    } catch {
      // Fall back to local cache
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export async function getSiteByIdUnified(siteId: string, deps: FrontdeskSaasDeps): Promise<FrontdeskSite | null> {
  if (!siteId) return null;

  const supabase = await deps.getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("frontdesk_sites").select("*").eq("id", siteId).single();
      if (!error && data) {
        return normalizeSiteDefaults(deps.hydrateFrontdeskSite(data));
      }
    } catch {
      // Fallback
    }
  }

  const local = deps.readFrontdeskSites().find((s) => s.id === siteId);
  return local ? normalizeSiteDefaults(local) : null;
}

export async function saveSiteUnified(site: FrontdeskSite, deps: FrontdeskSaasDeps): Promise<FrontdeskSite> {
  const normalized = normalizeSiteDefaults({ ...site, updated_at: new Date().toISOString() });

  const sites = deps.readFrontdeskSites();
  const idx = sites.findIndex((s) => s.id === normalized.id);
  if (idx >= 0) {
    sites[idx] = normalized;
  } else {
    sites.unshift(normalized);
  }
  deps.writeFrontdeskSites(sites);

  const supabase = await deps.getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("frontdesk_sites")
        .upsert([deps.serializeSiteForSupabase(normalized)]);
      if (error) {
        console.warn("⚠️ Supabase saveSiteUnified warning:", error.message || error);
      }
    } catch {
      // Fallback saved in local JSON
    }
  }

  return normalized;
}

export async function findSitesByEmail(email: string, deps: FrontdeskSaasDeps): Promise<FrontdeskSite[]> {
  const target = email.trim().toLowerCase();
  if (!target) return [];
  const all = await listAllSites(deps);
  return all.filter((s) => s.contact_email?.trim().toLowerCase() === target);
}

export async function findDuplicateTrialSite(
  email: string,
  websiteUrl: string,
  deps: FrontdeskSaasDeps,
  pathPrefix?: string
): Promise<FrontdeskSite | null> {
  const normEmail = email.trim().toLowerCase();
  const normHost = normalizeRootHost(websiteUrl);
  const normPrefix = (pathPrefix || "").trim().toLowerCase();
  const all = await listAllSites(deps);

  return (
    all.find((s) => {
      if (s.is_internal) return false;
      const sameEmail = Boolean(normEmail && s.contact_email?.trim().toLowerCase() === normEmail);
      const sameHost = Boolean(normHost && normalizeRootHost(s.website_url) === normHost);
      const samePrefix = (s.path_prefix || "").trim().toLowerCase() === normPrefix;
      return sameEmail && sameHost && samePrefix;
    }) ||
    all.find((s) => {
      if (s.is_internal) return false;
      const sameHost = Boolean(normHost && normalizeRootHost(s.website_url) === normHost);
      const samePrefix = (s.path_prefix || "").trim().toLowerCase() === normPrefix;
      return sameHost && samePrefix;
    }) ||
    all.find((s) => !s.is_internal && Boolean(normEmail && s.contact_email?.trim().toLowerCase() === normEmail)) ||
    null
  );
}

export async function listLeadsForSiteUnified(siteId: string, deps: FrontdeskSaasDeps): Promise<FrontdeskLead[]> {
  const byId = new Map<string, FrontdeskLead>();
  for (const lead of deps.readFrontdeskLeads()) {
    if (lead.site_id === siteId) byId.set(lead.id, lead);
  }

  const supabase = await deps.getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("frontdesk_leads")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && Array.isArray(data)) {
        for (const row of data) {
          byId.set(row.id, row as FrontdeskLead);
        }
      }
    } catch {
      // Fallback
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

export interface LifecycleEvaluation {
  site: FrontdeskSite;
  subscriptionStatus: SubscriptionStatus;
  widgetVisible: boolean;
  hiddenReason?: "paused" | "disabled" | "domain_not_allowed";
  daysRemaining?: number;
  changed: boolean;
  emailDispatchedKey?: string;
}

export async function evaluateSubscriptionLifecycle(
  rawSite: FrontdeskSite,
  deps: FrontdeskSaasDeps,
  options: { sendEmails?: boolean; nowMs?: number } = {}
): Promise<LifecycleEvaluation> {
  let site = normalizeSiteDefaults(rawSite);
  const now = options.nowMs ?? Date.now();
  const sub: SiteSubscription = { ...(site.subscription || { status: "trialing" }) };
  const emailsSent: Record<string, string> = { ...(site.emails_sent || {}) };
  let changed = false;
  let emailDispatchedKey: string | undefined;

  if (site.is_internal) {
    sub.status = "internal";
    site.subscription = sub;
    const widgetVisible = site.enabled !== false;
    return {
      site,
      subscriptionStatus: "internal",
      widgetVisible,
      hiddenReason: widgetVisible ? undefined : "disabled",
      changed: false
    };
  }

  if (site.is_comped) {
    if (sub.status !== "comped") {
      sub.status = "comped";
      changed = true;
    }
    site.subscription = sub;
    if (changed) site = await saveSiteUnified(site, deps);
    const widgetVisible = site.enabled !== false;
    return {
      site,
      subscriptionStatus: "comped",
      widgetVisible,
      hiddenReason: widgetVisible ? undefined : "disabled",
      changed
    };
  }

  // Active paid subscriber
  if (sub.status === "active") {
    if (site.status !== "active") {
      site.status = "active";
      changed = true;
    }
  } else if (sub.status === "canceling") {
    const endMs = sub.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
    if (endMs && now >= endMs) {
      sub.status = "paused";
      sub.pause_reason = "canceled";
      site.status = "paused";
      changed = true;
    }
  } else if (sub.status === "past_due") {
    const pastDueMs = sub.past_due_since ? new Date(sub.past_due_since).getTime() : now;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    if (now >= pastDueMs + threeDaysMs) {
      sub.status = "paused";
      sub.pause_reason = "payment_failed";
      site.status = "paused";
      changed = true;

      if (options.sendEmails && !emailsSent.paused_payment_failed && site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
        const r = await sendTrialPausedEmail(site, loginUrl, "payment_failed", deps.getResend);
        if (r.success) {
          emailsSent.paused_payment_failed = new Date(now).toISOString();
          emailDispatchedKey = "paused_payment_failed";
          changed = true;
        }
      }
    }
  } else if (sub.status === "trialing" || sub.status === "grace") {
    const trialEndsMs = site.trial_ends_at
      ? new Date(site.trial_ends_at).getTime()
      : new Date(site.created_at).getTime() + 30 * 24 * 60 * 60 * 1000;
    const graceEndsMs = site.grace_ends_at
      ? new Date(site.grace_ends_at).getTime()
      : trialEndsMs + 3 * 24 * 60 * 60 * 1000;

    if (now < trialEndsMs) {
      if (sub.status !== "trialing") {
        sub.status = "trialing";
        site.status = "active";
        changed = true;
      }
    } else if (now < graceEndsMs) {
      if (sub.status !== "grace" || site.status !== "grace_period") {
        sub.status = "grace";
        site.status = "grace_period";
        changed = true;
      }
      if (options.sendEmails && !emailsSent.day30 && !site.trial_expiry_email_sent_at && site.contact_email) {
        const leads = await listLeadsForSiteUnified(site.id, deps);
        const analytics = await getFrontdeskAnalytics({
          siteId: site.id,
          days: 30,
          leads,
          supabase: await deps.getSupabase()
        });
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
        const r = await sendTrialCountdownEmail(
          site,
          0,
          { leads: analytics.totals.leads, conversations: analytics.totals.conversations },
          loginUrl,
          deps.getResend
        );
        if (r.success) {
          const ts = new Date(now).toISOString();
          emailsSent.day30 = ts;
          site.trial_expiry_email_sent_at = ts;
          emailDispatchedKey = "day30";
          changed = true;
        }
      }
    } else {
      sub.status = "paused";
      sub.pause_reason = sub.pause_reason || "trial_expired";
      site.status = "soft_locked";
      changed = true;
      if (options.sendEmails && !emailsSent.day33_paused && !site.grace_ended_email_sent_at && site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
        const r = await sendTrialPausedEmail(site, loginUrl, "trial_expired", deps.getResend);
        if (r.success) {
          const ts = new Date(now).toISOString();
          emailsSent.day33_paused = ts;
          site.grace_ended_email_sent_at = ts;
          emailDispatchedKey = "day33_paused";
          changed = true;
        }
      }
    }
  }

  site.subscription = sub;
  site.emails_sent = emailsSent;
  if (changed) {
    site = await saveSiteUnified(site, deps);
  }

  const trialEndMs = site.trial_ends_at ? new Date(site.trial_ends_at).getTime() : 0;
  const daysRemaining =
    sub.status === "trialing" && trialEndMs > now
      ? Math.max(0, Math.ceil((trialEndMs - now) / (24 * 60 * 60 * 1000)))
      : 0;

  let widgetVisible = true;
  let hiddenReason: "paused" | "disabled" | undefined;
  if (sub.status === "paused") {
    widgetVisible = false;
    hiddenReason = "paused";
  } else if (site.enabled === false) {
    widgetVisible = false;
    hiddenReason = "disabled";
  }

  return {
    site,
    subscriptionStatus: sub.status,
    widgetVisible,
    hiddenReason,
    daysRemaining,
    changed,
    emailDispatchedKey
  };
}

export function checkSiteOriginLock(req: express.Request, site: FrontdeskSite): { allowed: boolean } {
  if (!site.website_url || site.is_internal || !site.contact_email) {
    return { allowed: true };
  }
  const registeredHost = normalizeRootHost(site.website_url);
  if (!registeredHost) return { allowed: true };

  const originHeader = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const refererHeader = typeof req.headers.referer === "string" ? req.headers.referer : "";
  const caller = originHeader || refererHeader;
  if (!caller) return { allowed: true };

  const callerHost = normalizeRootHost(caller);
  if (!callerHost) return { allowed: true };

  if (
    callerHost === "localhost" ||
    callerHost === "127.0.0.1" ||
    callerHost === "localsurgeseo.com" ||
    callerHost.endsWith(".localsurgeseo.com")
  ) {
    return { allowed: true };
  }

  if (callerHost === registeredHost || callerHost.endsWith(`.${registeredHost}`)) {
    return { allowed: true };
  }

  return { allowed: false };
}

export function buildPublicSiteResponse(
  req: express.Request,
  site: FrontdeskSite,
  evalResult: LifecycleEvaluation
) {
  const originCheck = checkSiteOriginLock(req, site);
  const widgetVisible = evalResult.widgetVisible && originCheck.allowed;
  const hiddenReason = !evalResult.widgetVisible
    ? evalResult.hiddenReason
    : !originCheck.allowed
    ? "domain_not_allowed"
    : undefined;

  const wc = { ...site.widget_config };
  if (
    site.lead_delivery?.mode === "form" &&
    site.lead_delivery.form &&
    !site.lead_delivery.form.has_captcha &&
    site.lead_delivery.form.form_selector
  ) {
    wc.formDelivery = {
      page_url: site.lead_delivery.form.page_url,
      form_selector: site.lead_delivery.form.form_selector,
      submit_selector: site.lead_delivery.form.submit_selector,
      auto_submit: Boolean(site.lead_delivery.form.auto_submit),
      field_map: site.lead_delivery.form.field_map || {}
    };
  } else {
    delete wc.formDelivery;
  }

  return {
    success: true,
    widgetVisible,
    ...(hiddenReason ? { hiddenReason } : {}),
    site: {
      id: site.id,
      business_name: site.business_name,
      industry: site.industry,
      website_url: site.website_url,
      phone: site.phone,
      emergency_phone: site.emergency_phone,
      service_radius: site.service_radius,
      estimate_policy: site.estimate_policy,
      working_hours: site.working_hours,
      widget_config: wc,
      feature_flags: {
        enablePhotoUpload: Boolean(site.feature_flags?.enablePhotoUpload),
        enableEmailDispatch: true,
        enableSmsDispatch: Boolean(site.feature_flags?.enableSmsDispatch),
        enablePhoneCallback: Boolean(site.feature_flags?.enablePhoneCallback),
        enableEmergencyBanner: Boolean(site.feature_flags?.enableEmergencyBanner),
        enableDirectBooking: Boolean(site.feature_flags?.enableDirectBooking),
        enableCustomBranding: true,
        planTier: site.feature_flags?.planTier || "trial"
      },
      status: evalResult.subscriptionStatus === "paused" ? "paused" : "active",
      path_prefix: site.path_prefix,
      allowed_paths: site.allowed_paths
    }
  };
}

export async function buildPortalSiteDTO(siteRaw: FrontdeskSite, deps: FrontdeskSaasDeps): Promise<PortalSite> {
  const ev = await evaluateSubscriptionLifecycle(siteRaw, deps, { sendEmails: false });
  const site = ev.site;
  const leads = await listLeadsForSiteUnified(site.id, deps);
  const analytics30 = await getFrontdeskAnalytics({
    siteId: site.id,
    days: 30,
    leads,
    supabase: await deps.getSupabase()
  });

  const ppCfg = getPaypalConfig();
  return {
    id: site.id,
    business_name: site.business_name,
    website_url: site.website_url,
    phone: site.phone,
    contact_name: site.contact_name,
    contact_email: site.contact_email,
    enabled: site.enabled !== false,
    widgetVisible: ev.widgetVisible,
    installed_at: site.installed_at || null,
    last_seen_at: site.last_seen_at || null,
    last_seen_origin: site.last_seen_origin || null,
    last_crawled_at: site.last_crawled_at || site.scraped_knowledge?.extractedAt || null,
    trial_ends_at: site.trial_ends_at || null,
    grace_ends_at: site.grace_ends_at || null,
    is_comped: Boolean(site.is_comped),
    is_internal: Boolean(site.is_internal),
    subscription: site.subscription || { status: "trialing", provider: null },
    widget_config: site.widget_config,
    lead_delivery: site.lead_delivery || { mode: "email", notify_email: site.contact_email },
    scraped_knowledge: site.scraped_knowledge,
    custom_instructions: site.custom_instructions,
    billingConfigured: billingConfigured(),
    paypalClientId: ppCfg.clientId || null,
    paypalPlanId: ppCfg.planId || null,
    monthlyPriceUsd: FRONTDESK_PRICE_USD,
    stats: {
      leads30d: analytics30.totals.leads,
      chats30d: analytics30.totals.conversations
    }
  };
}

function escapeCsvCell(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function runLifecycleCron(deps: FrontdeskSaasDeps) {
  const sites = await listAllSites(deps);
  const supabase = await deps.getSupabase();
  const now = Date.now();
  let checked = 0;
  let transitioned = 0;
  let emailsDispatched = 0;

  for (const rawSite of sites) {
    if (rawSite.is_internal) continue;
    checked++;

    const ev = await evaluateSubscriptionLifecycle(rawSite, deps, { sendEmails: true, nowMs: now });
    if (ev.changed) transitioned++;
    if (ev.emailDispatchedKey) emailsDispatched++;

    const site = ev.site;
    if (!site.contact_email) continue;

    // Trial Day 23 (<=7d remaining) & Day 27 (<=3d remaining) reminders
    if (ev.subscriptionStatus === "trialing" && site.trial_ends_at) {
      const daysLeft = Math.ceil((new Date(site.trial_ends_at).getTime() - now) / (24 * 60 * 60 * 1000));
      const emailsSent = { ...(site.emails_sent || {}) };

      if (daysLeft <= 7 && daysLeft > 3 && !emailsSent.day23) {
        const leads = await listLeadsForSiteUnified(site.id, deps);
        const analytics = await getFrontdeskAnalytics({ siteId: site.id, days: 30, leads, supabase });
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
        const r = await sendTrialCountdownEmail(
          site,
          7,
          { leads: analytics.totals.leads, conversations: analytics.totals.conversations },
          loginUrl,
          deps.getResend
        );
        if (r.success) {
          emailsSent.day23 = new Date(now).toISOString();
          site.emails_sent = emailsSent;
          await saveSiteUnified(site, deps);
          emailsDispatched++;
        }
      } else if (daysLeft <= 3 && daysLeft > 0 && !emailsSent.day27) {
        const leads = await listLeadsForSiteUnified(site.id, deps);
        const analytics = await getFrontdeskAnalytics({ siteId: site.id, days: 30, leads, supabase });
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
        const r = await sendTrialCountdownEmail(
          site,
          3,
          { leads: analytics.totals.leads, conversations: analytics.totals.conversations },
          loginUrl,
          deps.getResend
        );
        if (r.success) {
          emailsSent.day27 = new Date(now).toISOString();
          site.emails_sent = emailsSent;
          await saveSiteUnified(site, deps);
          emailsDispatched++;
        }
      }
    }

    // Weekly engagement digest (Mondays or >= 7 days since last digest, active widgets only)
    if (ev.widgetVisible && ["trialing", "active", "comped", "grace"].includes(ev.subscriptionStatus)) {
      const lastDigest = site.emails_sent?.weekly_digest ? new Date(site.emails_sent.weekly_digest).getTime() : 0;
      const dueForWeekly = !lastDigest || now - lastDigest >= 6.5 * 24 * 60 * 60 * 1000;
      const isMondayUtc = new Date(now).getUTCDay() === 1;
      if (isMondayUtc && dueForWeekly) {
        const leads = await listLeadsForSiteUnified(site.id, deps);
        const stats7 = await getFrontdeskAnalytics({ siteId: site.id, days: 7, leads, supabase });
        if (stats7.totals.conversations > 0 || stats7.totals.leads > 0) {
          const loginUrl = issueMagicLoginToken(site.contact_email, site.id).url;
          const r = await sendWeeklyDigestEmail(site, stats7.totals, loginUrl, deps.getResend);
          if (r.success) {
            site.emails_sent = { ...(site.emails_sent || {}), weekly_digest: new Date(now).toISOString() };
            await saveSiteUnified(site, deps);
            emailsDispatched++;
          }
        }
      }
    }
  }

  return { checked, transitioned, emailsDispatched };
}

function setPublicCorsHeaders(res: express.Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function isValidHexColor(c: unknown): c is string {
  return typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c.trim());
}

export function registerFrontdeskSaasRoutes(app: express.Application, deps: FrontdeskSaasDeps) {
  // 0a. Public CORS & Widget Configuration Fetch (domain lock + lifecycle enforcement)
  app.options("/api/frontdesk/sites/:id", (_req, res) => {
    setPublicCorsHeaders(res);
    return res.sendStatus(204);
  });

  app.options("/api/frontdesk/chat", (_req, res) => {
    setPublicCorsHeaders(res);
    return res.sendStatus(204);
  });

  app.get("/api/frontdesk/sites/:id", async (req, res) => {
    setPublicCorsHeaders(res);
    const site = await getSiteByIdUnified(req.params.id, deps);
    if (!site) {
      return res.status(404).json({ success: false, error: `Site ID "${req.params.id}" not found.` });
    }
    const evalResult = await evaluateSubscriptionLifecycle(site, deps, { sendEmails: false });
    return res.json(buildPublicSiteResponse(req, evalResult.site, evalResult));
  });

  // 0b. Billing link redirect helper (PayPal dashboard upgrade)
  app.get("/api/frontdesk/checkout-url", (req, res) => {
    const siteId = String(req.query.siteId || "").trim();
    const baseUrl = getPublicAppBaseUrl(req);
    const dashboardUrl = siteId
      ? `${baseUrl}/ai-frontdesk/dashboard?siteId=${encodeURIComponent(siteId)}&tab=billing`
      : `${baseUrl}/ai-frontdesk/dashboard?tab=billing`;
    return res.json({
      success: true,
      checkoutUrl: dashboardUrl,
      monthlyPriceUsd: FRONTDESK_PRICE_USD
    });
  });

  // 0c. Standalone 30-Day Free Trial Onboarding ($0 today, $5/mo optional later)
  app.post("/api/frontdesk/trial", async (req, res) => {
    try {
      if (deps.isRateLimited && deps.isRateLimited(deps.getClientIp(req))) {
        return res.status(429).json({
          success: false,
          error: "Too many trial requests from this IP. Please try again in a few minutes."
        });
      }

      const body = req.body || {};
      const businessName = body.businessName;
      const websiteUrl = body.websiteUrl || body.domain;
      const contactName = body.contactName || body.name;
      const contactEmail = body.contactEmail || body.email;
      const phone = body.phone;
      const pathPrefix = body.pathPrefix;
      if (!businessName || !websiteUrl || !contactName || !contactEmail) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields (businessName, websiteUrl, contactName, contactEmail)."
        });
      }

      const cleanEmail = String(contactEmail).trim().toLowerCase().slice(0, 100);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, error: "Please enter a valid email address." });
      }

      let fullUrl = String(websiteUrl).trim();
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = `https://${fullUrl}`;
      }
      if (!(await assertSafePublicUrl(fullUrl))) {
        return res.status(400).json({
          success: false,
          error: "Invalid or unreachable website URL. Please provide a public website domain (e.g. https://yourbusiness.com)."
        });
      }

      let cleanPathPrefix = "";
      if (pathPrefix && typeof pathPrefix === "string") {
        cleanPathPrefix = pathPrefix.trim();
        if (cleanPathPrefix && !cleanPathPrefix.startsWith("/")) {
          cleanPathPrefix = `/${cleanPathPrefix}`;
        }
      }

      const duplicate = await findDuplicateTrialSite(cleanEmail, fullUrl, deps, cleanPathPrefix);
      if (duplicate) {
        const registeredEmail = (duplicate.contact_email || "").trim().toLowerCase();
        const sameOwnerEmail = registeredEmail === cleanEmail;
        if (registeredEmail) {
          const magic = issueMagicLoginToken(registeredEmail, duplicate.id, req);
          await sendMagicLinkEmail(registeredEmail, [duplicate.business_name], magic.url, deps.getResend);
        }
        const msg = sameOwnerEmail
          ? `An AI FrontDesk chatbot already exists for ${duplicate.business_name}. We just emailed a fresh login link to ${cleanEmail}.`
          : `An AI FrontDesk chatbot is already registered for this website domain (${duplicate.business_name}). We sent a login link to the registered account owner's email.`;
        return res.status(409).json({
          success: false,
          existingAccount: true,
          siteId: duplicate.id,
          error: msg,
          message: msg
        });
      }

      const bName = String(businessName).trim().slice(0, 120);
      const cName = String(contactName).trim().slice(0, 100);
      const siteId = `site_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const nowIso = new Date().toISOString();
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const graceEndsAt = new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString();

      let newSite: FrontdeskSite = normalizeSiteDefaults({
        id: siteId,
        created_at: nowIso,
        updated_at: nowIso,
        business_name: bName,
        industry: "Local Business",
        website_url: fullUrl,
        phone: phone ? String(phone).trim().slice(0, 40) : undefined,
        contact_name: cName,
        contact_email: cleanEmail,
        is_trial: true,
        is_internal: false,
        is_comped: false,
        enabled: true,
        trial_ends_at: trialEndsAt,
        grace_ends_at: graceEndsAt,
        path_prefix: cleanPathPrefix || undefined,
        allowed_paths: cleanPathPrefix ? [cleanPathPrefix] : undefined,
        status: "active",
        service_radius: { city: "Local Area", radiusMiles: 25, zipCodes: [] },
        estimate_policy: "Reach out anytime for details or to request an estimate.",
        working_hours: { weekday: "8:00 AM - 6:00 PM", weekend: "By Appointment", emergency247: false },
        widget_config: {
          themeColor: "#123e35",
          assistantName: "AI Assistant",
          iconPreset: "chat",
          position: "right",
          greeting: `Hi! Thanks for visiting ${bName}. Ask me anything or leave your details below!`,
          speedToLeadCity: "Local Area",
          quickChips: ["What services do you offer?", "Request an estimate", "How can I contact you?"],
          showPoweredBy: true
        },
        feature_flags: {
          enablePhotoUpload: false,
          enableEmailDispatch: true,
          enableSmsDispatch: false,
          enablePhoneCallback: false,
          enableEmergencyBanner: false,
          enableDirectBooking: false,
          enableCustomBranding: true,
          planTier: "trial"
        },
        subscription: {
          status: "trialing",
          provider: null
        },
        lead_delivery: {
          mode: "email",
          notify_email: cleanEmail
        },
        emails_sent: {},
        scraped_knowledge: {}
      });

      newSite = await saveSiteUnified(newSite, deps);

      // Run quick initial website scan (race against 6s budget so Vercel functions never hang or drop it)
      const crawlPromise = crawlSiteKnowledge(fullUrl, deps.getGemini, {
        businessName: bName,
        deepCrawl: true
      })
        .then(async (crawlResult) => {
          newSite.scraped_knowledge = crawlResult.knowledge;
          newSite.last_crawled_at = new Date().toISOString();
          if (crawlResult.detectedForms && crawlResult.detectedForms.length > 0) {
            newSite.lead_delivery = {
              ...(newSite.lead_delivery || { mode: "email", notify_email: cleanEmail }),
              detected_forms: crawlResult.detectedForms
            };
          }
          await saveSiteUnified(newSite, deps);
        })
        .catch((err) => {
          console.warn("⚠️ Initial trial crawl warning:", err);
        });

      await Promise.race([
        crawlPromise,
        new Promise((resolve) => setTimeout(resolve, 5500))
      ]);

      const magic = issueMagicLoginToken(cleanEmail, siteId, req);
      const emailResult = await sendSaasWelcomeEmail(newSite, magic.url, deps.getResend);
      if (emailResult.success) {
        newSite.emails_sent = { ...(newSite.emails_sent || {}), welcome: new Date().toISOString() };
        await saveSiteUnified(newSite, deps);
      }

      const scriptTag = `<script src="https://localsurgeseo.com/widget.js" data-site-id="${siteId}" defer></script>`;
      return res.json({
        success: true,
        siteId,
        trialEndsAt,
        scriptTag,
        dashboardUrl: magic.url,
        pathPrefix: cleanPathPrefix || undefined,
        emailDispatched: emailResult.success,
        emailError: emailResult.success ? undefined : emailResult.error,
        site: newSite,
        instructions: {
          wordpress: "Install WPCode -> Code Snippets > Header & Footer -> paste in Footer -> Save.",
          wix: "Settings > Custom Code -> + Add Custom Code -> Body - End -> Apply.",
          shopify: "Online Store > Themes > Edit Code > theme.liquid -> paste before </body> -> Save.",
          squarespace: "Website > Website Tools > Code Injection -> paste in Footer -> Save.",
          webflow: "Project Settings > Custom Code -> Footer Code -> Save & Publish.",
          html: "Paste right before the closing </body> tag on your website."
        }
      });
    } catch (outerErr: any) {
      console.error("❌ Error in POST /api/frontdesk/trial:", outerErr);
      return res.status(500).json({
        success: false,
        error: outerErr?.message || "Failed to start trial. Please try again."
      });
    }
  });

  // 1. Widget Analytics Tracking (supports JSON + navigator.sendBeacon text/plain)
  app.options("/api/frontdesk/track", (_req, res) => {
    setPublicCorsHeaders(res);
    return res.sendStatus(204);
  });

  app.post(
    "/api/frontdesk/track",
    express.text({ type: ["text/plain", "application/json"], limit: "32kb" }),
    async (req, res) => {
      setPublicCorsHeaders(res);
      let body: any = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ ok: false, error: "Invalid JSON payload" });
        }
      }

      const { siteId, sessionId, type, value, meta } = body || {};
      if (!siteId || !type) {
        return res.status(400).json({ ok: false, error: "siteId and type are required." });
      }
      if (!["load", "open", "message", "lead", "session_end", "form_submit"].includes(type)) {
        return res.status(400).json({ ok: false, error: "Unsupported event type." });
      }

      const supabase = await deps.getSupabase();
      const recorded = await recordFrontdeskEvent(
        { siteId: String(siteId), sessionId: sessionId ? String(sessionId) : null, type, value, meta },
        supabase
      );

      // Mark widget as installed & seen on real `load` events
      if (type === "load") {
        const site = await getSiteByIdUnified(String(siteId), deps);
        if (site) {
          const originHeader =
            typeof req.headers.origin === "string"
              ? req.headers.origin
              : typeof req.headers.referer === "string"
              ? req.headers.referer
              : null;
          const nowIso = new Date().toISOString();
          const lastSeenMs = site.last_seen_at ? new Date(site.last_seen_at).getTime() : 0;
          const shouldPersistInstall = !site.installed_at || Date.now() - lastSeenMs > 5 * 60 * 1000;
          if (shouldPersistInstall) {
            site.installed_at = site.installed_at || nowIso;
            site.last_seen_at = nowIso;
            if (originHeader) site.last_seen_origin = originHeader.slice(0, 200);
            await saveSiteUnified(site, deps);
          }
        }
      }

      return res.json({ ok: recorded });
    }
  );

  // 2. Customer Portal Auth: Magic Link Request, Verify, Logout, Me
  app.post("/api/frontdesk/portal/auth/request-link", async (req, res) => {
    if (isMagicLinkRateLimited(deps.getClientIp(req))) {
      return res.status(429).json({
        ok: false,
        error: "Too many login link requests. Please wait a few minutes and try again."
      });
    }
    const email = String(req.body?.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
    }

    const matchingSites = (await findSitesByEmail(email, deps)).filter((s) => !s.is_internal);
    if (matchingSites.length === 0) {
      return res.json({
        ok: true,
        found: false,
        message: "We couldn't find an AI FrontDesk account for that email address."
      });
    }

    const primarySite = matchingSites[0];
    const magic = issueMagicLoginToken(email, primarySite.id, req);
    const sendResult = await sendMagicLinkEmail(
      email,
      matchingSites.map((s) => s.business_name),
      magic.url,
      deps.getResend
    );

    return res.json({
      ok: true,
      found: true,
      emailSent: sendResult.success,
      message: sendResult.success
        ? "We emailed your one-click login link. Check your inbox (it expires in 30 minutes)."
        : "Your account exists, but email delivery is currently unavailable. Please contact support."
    });
  });

  app.post("/api/frontdesk/portal/auth/verify", async (req, res) => {
    const token = String(req.body?.token || req.query?.token || "").trim();
    if (!token) {
      return res.status(400).json({ ok: false, error: "Login token is missing." });
    }

    const check = verifyAndConsumeMagicLoginToken(token);
    if (check.valid === false) {
      return res.status(401).json({ ok: false, error: check.error });
    }

    const owned = await findSitesByEmail(check.email, deps);
    if (owned.length === 0) {
      return res.status(403).json({ ok: false, error: "No AI FrontDesk sites are linked to this email." });
    }

    setPortalSessionCookie(res, check.email, req);
    return res.json({
      ok: true,
      email: check.email,
      siteId: check.siteId || owned[0].id
    });
  });

  app.post("/api/frontdesk/portal/auth/logout", (req, res) => {
    clearPortalSessionCookie(res, req);
    return res.json({ ok: true });
  });

  app.get("/api/frontdesk/portal/me", async (req, res) => {
    const email = getSessionEmailFromRequest(req);
    if (!email) {
      return res.status(401).json({ ok: false, authenticated: false, error: "Not signed in." });
    }

    const sites = await findSitesByEmail(email, deps);
    const dtos = await Promise.all(sites.map((s) => buildPortalSiteDTO(s, deps)));
    return res.json({
      ok: true,
      authenticated: true,
      email,
      sites: dtos
    });
  });

  // Helper middleware verifying fd_session + site ownership
  async function requireOwnedSite(req: express.Request, res: express.Response): Promise<{ email: string; site: FrontdeskSite } | null> {
    const email = getSessionEmailFromRequest(req);
    if (!email) {
      res.status(401).json({ ok: false, error: "Session expired or missing. Please request a login link." });
      return null;
    }

    const site = await getSiteByIdUnified(req.params.id, deps);
    if (!site) {
      res.status(404).json({ ok: false, error: "Chatbot site not found." });
      return null;
    }

    if (!userOwnsSite(site, email)) {
      res.status(403).json({ ok: false, error: "You do not have permission to manage this chatbot." });
      return null;
    }

    return { email, site };
  }

  // 3. Portal Site Details & Settings
  app.get("/api/frontdesk/portal/sites/:id", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;
    const dto = await buildPortalSiteDTO(owned.site, deps);
    return res.json({ ok: true, site: dto });
  });

  app.patch("/api/frontdesk/portal/sites/:id/settings", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const site = { ...owned.site };
    const body = req.body || {};

    if (typeof body.enabled === "boolean") {
      site.enabled = body.enabled;
    }
    if (typeof body.business_name === "string" && body.business_name.trim()) {
      site.business_name = body.business_name.trim().slice(0, 120);
    }
    if (typeof body.phone === "string") {
      site.phone = body.phone.trim().slice(0, 40);
    }
    if (typeof body.custom_instructions === "string") {
      site.custom_instructions = body.custom_instructions.trim().slice(0, 1200);
    }
    if (typeof body.customNotes === "string") {
      site.scraped_knowledge = {
        ...(site.scraped_knowledge || {}),
        customNotes: body.customNotes.trim().slice(0, 2000)
      };
    }

    if (body.widget_config && typeof body.widget_config === "object") {
      const incoming = body.widget_config;
      const wc = { ...site.widget_config };
      if (isValidHexColor(incoming.themeColor)) wc.themeColor = incoming.themeColor.trim();
      if (typeof incoming.greeting === "string" && incoming.greeting.trim()) {
        wc.greeting = incoming.greeting.trim().slice(0, 280);
      }
      if (typeof incoming.assistantName === "string" && incoming.assistantName.trim()) {
        wc.assistantName = incoming.assistantName.trim().slice(0, 50);
      }
      if (incoming.position === "left" || incoming.position === "right") {
        wc.position = incoming.position;
      }
      if (typeof incoming.iconPreset === "string" && VALID_ICON_PRESETS.has(incoming.iconPreset)) {
        wc.iconPreset = incoming.iconPreset;
      }
      if (incoming.iconUrl === "" || incoming.iconUrl === null) {
        wc.iconUrl = undefined;
      } else if (typeof incoming.iconUrl === "string" && incoming.iconUrl.trim()) {
        const safeIcon = await assertSafePublicUrl(incoming.iconUrl.trim());
        if (!safeIcon || !incoming.iconUrl.trim().toLowerCase().startsWith("https://")) {
          return res.status(400).json({ ok: false, error: "Custom icon URL must be a valid public HTTPS image URL." });
        }
        wc.iconUrl = incoming.iconUrl.trim().slice(0, 400);
      }
      if (Array.isArray(incoming.quickChips)) {
        wc.quickChips = incoming.quickChips
          .map((c: unknown) => String(c || "").trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, 4);
      }
      site.widget_config = wc;
    }

    if (body.lead_delivery && typeof body.lead_delivery === "object") {
      const incoming = body.lead_delivery as LeadDeliveryConfig;
      const current = { ...(site.lead_delivery || { mode: "email" as const }) };

      if (incoming.mode && ["email", "endpoint", "form"].includes(incoming.mode)) {
        current.mode = incoming.mode;
      }
      if (typeof incoming.notify_email === "string") {
        const ne = incoming.notify_email.trim().toLowerCase();
        if (ne && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ne)) {
          return res.status(400).json({ ok: false, error: "Invalid notification email format." });
        }
        current.notify_email = ne || site.contact_email;
      }

      if (incoming.endpoint && typeof incoming.endpoint === "object") {
        const epUrl = String(incoming.endpoint.url || "").trim();
        if (epUrl) {
          const isSafe = await assertSafePublicUrl(epUrl);
          if (!isSafe) {
            return res.status(400).json({
              ok: false,
              error: "Webhook endpoint URL must be a public HTTP or HTTPS URL (private or local addresses are blocked)."
            });
          }
          current.endpoint = {
            url: epUrl.slice(0, 500),
            method: "POST",
            format: incoming.endpoint.format === "form" ? "form" : "json",
            headers: incoming.endpoint.headers && typeof incoming.endpoint.headers === "object" ? incoming.endpoint.headers : {},
            field_map: incoming.endpoint.field_map && typeof incoming.endpoint.field_map === "object" ? incoming.endpoint.field_map : {}
          };
        } else if (current.mode === "endpoint") {
          return res.status(400).json({ ok: false, error: "Please enter a webhook endpoint URL for Endpoint delivery mode." });
        }
      } else if (current.mode === "endpoint" && !current.endpoint?.url) {
        return res.status(400).json({ ok: false, error: "Please configure a webhook endpoint URL before selecting Endpoint mode." });
      }

      if (incoming.form && typeof incoming.form === "object") {
        current.form = {
          page_url: String(incoming.form.page_url || site.website_url || "").slice(0, 400),
          form_selector: String(incoming.form.form_selector || "").slice(0, 200),
          submit_selector: incoming.form.submit_selector ? String(incoming.form.submit_selector).slice(0, 200) : undefined,
          auto_submit: Boolean(incoming.form.auto_submit),
          has_captcha: Boolean(incoming.form.has_captcha),
          field_map: incoming.form.field_map && typeof incoming.form.field_map === "object" ? incoming.form.field_map : {}
        };
      } else if (current.mode === "form" && !current.form?.form_selector) {
        return res.status(400).json({ ok: false, error: "Please select a detected form or enter a CSS selector before enabling Form Auto-Fill mode." });
      }

      site.lead_delivery = current;
    }

    const updated = await saveSiteUnified(site, deps);
    const dto = await buildPortalSiteDTO(updated, deps);
    return res.json({ ok: true, site: dto });
  });

  // 4. Knowledge Re-scan (1 per 24h per site)
  app.post("/api/frontdesk/portal/sites/:id/rescan", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const site = owned.site;
    if (!site.website_url) {
      return res.status(400).json({ ok: false, error: "No website URL is configured on this chatbot." });
    }

    const lastMs = site.last_crawled_at ? new Date(site.last_crawled_at).getTime() : 0;
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (lastMs && Date.now() - lastMs < cooldownMs) {
      const nextAllowedAt = new Date(lastMs + cooldownMs).toISOString();
      return res.status(429).json({
        ok: false,
        error: "You can re-scan your website once every 24 hours.",
        nextAllowedAt
      });
    }

    const crawlResult = await crawlSiteKnowledge(site.website_url, deps.getGemini, {
      businessName: site.business_name,
      industry: site.industry,
      deepCrawl: true
    });

    const existingCustomNotes = site.scraped_knowledge?.customNotes;
    site.scraped_knowledge = {
      ...crawlResult.knowledge,
      ...(existingCustomNotes ? { customNotes: existingCustomNotes } : {})
    };
    site.last_crawled_at = new Date().toISOString();

    if (crawlResult.detectedForms && crawlResult.detectedForms.length > 0) {
      site.lead_delivery = {
        ...(site.lead_delivery || { mode: "email" }),
        detected_forms: crawlResult.detectedForms
      };
    }

    const updated = await saveSiteUnified(site, deps);
    const dto = await buildPortalSiteDTO(updated, deps);
    return res.json({
      ok: crawlResult.success,
      pagesScraped: crawlResult.pagesScraped,
      detectedForms: crawlResult.detectedForms || [],
      site: dto
    });
  });

  // 5. Check Installation on customer's homepage
  app.post("/api/frontdesk/portal/sites/:id/check-install", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;
    const site = owned.site;

    if (!site.website_url || !(await assertSafePublicUrl(site.website_url))) {
      return res.json({
        ok: true,
        foundOnPage: false,
        installed: Boolean(site.installed_at),
        lastSeenAt: site.last_seen_at || null,
        message: "Enter a valid public website URL in settings to run a live page scan."
      });
    }

    let foundOnPage = false;
    let inspectedUrl = site.website_url;
    try {
      const resp = await fetch(site.website_url, {
        headers: { "User-Agent": "LocalSurge-InstallChecker/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(7000)
      });
      inspectedUrl = resp.url || site.website_url;
      if (resp.ok) {
        const html = (await resp.text()).slice(0, 500_000);
        const hasScript = /widget\.js/i.test(html) && html.includes(site.id);
        foundOnPage = hasScript;
      }
    } catch {
      foundOnPage = false;
    }

    if (foundOnPage && !site.installed_at) {
      site.installed_at = new Date().toISOString();
      await saveSiteUnified(site, deps);
    }

    return res.json({
      ok: true,
      foundOnPage,
      installed: foundOnPage || Boolean(site.installed_at),
      lastSeenAt: site.last_seen_at || null,
      inspectedUrl,
      message: foundOnPage
        ? "Snippet detected on your website! Your chatbot is ready."
        : site.installed_at
        ? "Snippet traffic seen recently (could not find directly in raw homepage HTML — may load via GTM or a subpage)."
        : "Snippet not found yet. Make sure it's pasted right before </body> and published."
    });
  });

  // 6. Analytics Endpoint (7 / 30 / 90 days)
  app.get("/api/frontdesk/portal/sites/:id/analytics", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const daysParam = Number(req.query.days || 30);
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;
    const leads = await listLeadsForSiteUnified(owned.site.id, deps);
    const analytics = await getFrontdeskAnalytics({
      siteId: owned.site.id,
      days,
      leads,
      supabase: await deps.getSupabase()
    });

    return res.json({ ok: true, analytics });
  });

  // 7. Leads JSON + CSV Export + Test Delivery
  app.get("/api/frontdesk/portal/sites/:id/leads", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;
    const leads = await listLeadsForSiteUnified(owned.site.id, deps);
    return res.json({ ok: true, leads });
  });

  app.get("/api/frontdesk/portal/sites/:id/leads.csv", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;
    const leads = await listLeadsForSiteUnified(owned.site.id, deps);

    const header = ["Date", "Name", "Phone", "Email", "Message", "Delivery Channel"].map(escapeCsvCell).join(",");
    const rows = leads.map((l) =>
      [
        l.created_at,
        l.customer_name,
        l.customer_phone,
        l.customer_email || "",
        l.issue_description || "",
        l.dispatch_channel || "email"
      ]
        .map(escapeCsvCell)
        .join(",")
    );

    const csv = [header, ...rows].join("\r\n");
    const safeSlug = owned.site.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${safeSlug}-leads.csv"`);
    return res.send(csv);
  });

  app.post("/api/frontdesk/portal/sites/:id/lead-delivery/test", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const result = await sendTestLeadDelivery(owned.site, deps.getResend);
    return res.json({ ok: true, result });
  });

  // 8. PayPal Billing Endpoints ($5/month)
  app.post("/api/frontdesk/portal/sites/:id/billing/subscribe", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    if (!billingConfigured()) {
      return res.status(503).json({
        ok: false,
        code: "billing_not_configured",
        error: "PayPal subscription billing is not configured on the server yet."
      });
    }

    const baseUrl = getPublicAppBaseUrl(req);
    const returnUrl = `${baseUrl}/ai-frontdesk/dashboard?siteId=${encodeURIComponent(owned.site.id)}&paypal=success`;
    const cancelUrl = `${baseUrl}/ai-frontdesk/dashboard?siteId=${encodeURIComponent(owned.site.id)}&paypal=canceled`;

    try {
      const sub = await createPaypalSubscription({
        siteId: owned.site.id,
        subscriberEmail: owned.email,
        subscriberName: owned.site.contact_name || owned.site.business_name,
        returnUrl,
        cancelUrl
      });

      const site = { ...owned.site };
      site.subscription = {
        ...(site.subscription || { status: "trialing" }),
        provider: "paypal",
        paypal_subscription_id: sub.subscriptionId,
        paypal_plan_id: getPaypalConfig().planId
      };
      await saveSiteUnified(site, deps);

      return res.json({
        ok: true,
        subscriptionId: sub.subscriptionId,
        approveUrl: sub.approveUrl
      });
    } catch (err: any) {
      return res.status(502).json({ ok: false, error: err?.message || "PayPal create subscription failed." });
    }
  });

  app.post("/api/frontdesk/portal/sites/:id/billing/confirm", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const subscriptionId = String(
      req.body?.subscriptionId || owned.site.subscription?.paypal_subscription_id || ""
    ).trim();
    if (!subscriptionId) {
      return res.status(400).json({ ok: false, error: "subscriptionId is required." });
    }

    try {
      const details = await getPaypalSubscription(subscriptionId);
      if (details.customId && details.customId !== owned.site.id) {
        return res.status(403).json({ ok: false, error: "This PayPal subscription belongs to a different site." });
      }
      if (!["ACTIVE", "APPROVED"].includes(details.status)) {
        return res.status(409).json({
          ok: false,
          error: `PayPal subscription status is "${details.status}", not yet active.`
        });
      }

      const site = { ...owned.site };
      const nowIso = new Date().toISOString();
      const nextPeriod =
        details.nextBillingTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      site.is_trial = false;
      site.status = "active";
      site.subscription = {
        status: "active",
        provider: "paypal",
        paypal_subscription_id: details.id,
        paypal_plan_id: details.planId || getPaypalConfig().planId,
        current_period_end: nextPeriod,
        activated_at: site.subscription?.activated_at || nowIso,
        canceled_at: null,
        past_due_since: null,
        pause_reason: null
      };

      const emailsSent = { ...(site.emails_sent || {}) };
      if (!emailsSent.sub_activated && site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id, req).url;
        const mailRes = await sendSubscriptionActivatedEmail(site, loginUrl, deps.getResend);
        if (mailRes.success) emailsSent.sub_activated = nowIso;
      }
      site.emails_sent = emailsSent;

      const updated = await saveSiteUnified(site, deps);
      const dto = await buildPortalSiteDTO(updated, deps);
      return res.json({ ok: true, site: dto });
    } catch (err: any) {
      return res.status(502).json({ ok: false, error: err?.message || "PayPal verification failed." });
    }
  });

  app.post("/api/frontdesk/portal/sites/:id/billing/cancel", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const subId = owned.site.subscription?.paypal_subscription_id;
    if (!subId) {
      return res.status(400).json({ ok: false, error: "No active PayPal subscription found for this site." });
    }

    try {
      await cancelPaypalSubscription(subId);
      const site = { ...owned.site };
      const nowIso = new Date().toISOString();
      const periodEnd =
        site.subscription?.current_period_end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      site.subscription = {
        ...(site.subscription || { status: "active" }),
        status: "canceling",
        canceled_at: nowIso,
        current_period_end: periodEnd
      };

      if (site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id, req).url;
        await sendSubscriptionCanceledEmail(site, loginUrl, deps.getResend);
      }

      const updated = await saveSiteUnified(site, deps);
      const dto = await buildPortalSiteDTO(updated, deps);
      return res.json({ ok: true, site: dto });
    } catch (err: any) {
      return res.status(502).json({ ok: false, error: err?.message || "Failed to cancel PayPal subscription." });
    }
  });

  // 9. Custom Chatbot Upgrade Request -> Main SEO Leads Pipeline
  app.post("/api/frontdesk/portal/sites/:id/custom-request", async (req, res) => {
    const owned = await requireOwnedSite(req, res);
    if (!owned) return;

    const { goals, monthlyVolume, notes, phone } = req.body || {};
    const combinedNotes = [goals, monthlyVolume ? `Traffic: ${monthlyVolume}` : "", notes]
      .filter(Boolean)
      .join(" | ")
      .slice(0, 480);

    if (!combinedNotes) {
      return res.status(400).json({ ok: false, error: "Please tell us what you need in your custom chatbot." });
    }

    const result = await deps.processLeadSubmission(
      {
        planId: "custom-inquiry",
        planName: "Custom AI Chatbot Engineering Inquiry",
        businessName: owned.site.business_name,
        contactName: owned.site.contact_name || owned.site.business_name,
        email: owned.email,
        phone: String(phone || owned.site.phone || "Requested via Dashboard").slice(0, 40),
        website: owned.site.website_url || "",
        hasWebsite: Boolean(owned.site.website_url),
        industry: owned.site.industry || "Local Business",
        location: owned.site.service_radius?.city || "United States",
        keywords: combinedNotes
      },
      { sourceChannel: "frontdesk_dashboard_custom_request", runGeminiAudit: false }
    );

    if (!result.ok) {
      return res.status(result.status || 400).json({ ok: false, error: result.error || "Failed to submit inquiry." });
    }

    return res.json({ ok: true, leadId: result.lead?.id });
  });

  // 10. PayPal Subscriptions Webhook
  app.post("/api/frontdesk/webhook/paypal", async (req, res) => {
    const verified = await verifyPaypalWebhookSignature(req.headers, req.body);
    if (!verified) {
      return res.status(401).json({ ok: false, error: "Invalid PayPal webhook signature." });
    }

    const eventType = String(req.body?.event_type || "").toUpperCase();
    const resource = req.body?.resource || {};
    const subId = String(resource.billing_agreement_id || resource.id || "").trim();
    const customSiteId = String(resource.custom_id || "").trim();

    const allSites = await listAllSites(deps);
    const site =
      (customSiteId ? allSites.find((s) => s.id === customSiteId) : null) ||
      (subId ? allSites.find((s) => s.subscription?.paypal_subscription_id === subId) : null) ||
      null;

    if (!site) {
      return res.json({ ok: true, ignored: true, reason: "Site not found for webhook event" });
    }

    const nowIso = new Date().toISOString();
    const sub: SiteSubscription = { ...(site.subscription || { status: "trialing" }), provider: "paypal" };
    if (subId && !sub.paypal_subscription_id) sub.paypal_subscription_id = subId;

    if (eventType === "BILLING.SUBSCRIPTION.ACTIVATED" || eventType === "BILLING.SUBSCRIPTION.RE-ACTIVATED") {
      sub.status = "active";
      sub.activated_at = sub.activated_at || nowIso;
      sub.canceled_at = null;
      sub.past_due_since = null;
      sub.pause_reason = null;
      if (resource.billing_info?.next_billing_time) {
        sub.current_period_end = resource.billing_info.next_billing_time;
      }
      site.is_trial = false;
      site.status = "active";
      if (site.contact_email && !site.emails_sent?.sub_activated) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id, req).url;
        const r = await sendSubscriptionActivatedEmail(site, loginUrl, deps.getResend);
        if (r.success) site.emails_sent = { ...(site.emails_sent || {}), sub_activated: nowIso };
      }
    } else if (eventType === "PAYMENT.SALE.COMPLETED") {
      sub.status = "active";
      sub.past_due_since = null;
      sub.pause_reason = null;
      sub.current_period_end = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();
      site.status = "active";
    } else if (eventType === "PAYMENT.SALE.DENIED" || eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      sub.status = "past_due";
      sub.past_due_since = sub.past_due_since || nowIso;
      if (site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id, req).url;
        await sendPaymentFailedEmail(site, loginUrl, deps.getResend);
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
      const endMs = sub.current_period_end ? new Date(sub.current_period_end).getTime() : 0;
      if (endMs > Date.now()) {
        sub.status = "canceling";
      } else {
        sub.status = "paused";
        sub.pause_reason = "canceled";
        site.status = "paused";
      }
      sub.canceled_at = sub.canceled_at || nowIso;
      if (site.contact_email) {
        const loginUrl = issueMagicLoginToken(site.contact_email, site.id, req).url;
        await sendSubscriptionCanceledEmail(site, loginUrl, deps.getResend);
      }
    } else if (eventType === "BILLING.SUBSCRIPTION.SUSPENDED" || eventType === "BILLING.SUBSCRIPTION.EXPIRED") {
      sub.status = "paused";
      sub.pause_reason = eventType === "BILLING.SUBSCRIPTION.SUSPENDED" ? "payment_failed" : "canceled";
      site.status = "paused";
    }

    site.subscription = sub;
    await saveSiteUnified(site, deps);
    return res.json({ ok: true, eventType, siteId: site.id, status: sub.status });
  });

  // 11. Vercel Daily Lifecycle Cron
  app.get("/api/frontdesk/cron/lifecycle", async (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = String(req.headers.authorization || "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    const validCron = Boolean(cronSecret && bearer && bearer === cronSecret);
    const validAdmin = deps.isAdminRequest(req);
    if (!validCron && !validAdmin) {
      return res.status(401).json({ ok: false, error: "Unauthorized cron trigger." });
    }

    const summary = await runLifecycleCron(deps);
    return res.json({ ok: true, ...summary });
  });

  // 12. Owner Admin SaaS Overview & Lifecycle Controls (/admin/dashboard)
  app.get("/api/frontdesk/admin/accounts", deps.requireAdmin, async (_req, res) => {
    const sites = await listAllSites(deps);
    const leads = deps.readFrontdeskLeads();

    let payingCount = 0;
    let cancelingCount = 0;
    let trialingCount = 0;
    let graceCount = 0;
    let pastDueCount = 0;
    let pausedCount = 0;
    let compedCount = 0;
    let internalCount = 0;

    const accounts = await Promise.all(
      sites.map(async (raw) => {
        const ev = await evaluateSubscriptionLifecycle(raw, deps, { sendEmails: false });
        const s = ev.site;
        const st = ev.subscriptionStatus;

        if (st === "active") payingCount++;
        else if (st === "canceling") cancelingCount++;
        else if (st === "trialing") trialingCount++;
        else if (st === "grace") graceCount++;
        else if (st === "past_due") pastDueCount++;
        else if (st === "paused") pausedCount++;
        else if (st === "comped") compedCount++;
        else if (st === "internal") internalCount++;

        const siteLeads = leads.filter((l) => l.site_id === s.id);
        return {
          id: s.id,
          business_name: s.business_name,
          website_url: s.website_url,
          contact_name: s.contact_name,
          contact_email: s.contact_email,
          created_at: s.created_at,
          installed_at: s.installed_at || null,
          last_seen_at: s.last_seen_at || null,
          trial_ends_at: s.trial_ends_at || null,
          enabled: s.enabled !== false,
          widgetVisible: ev.widgetVisible,
          is_comped: Boolean(s.is_comped),
          is_internal: Boolean(s.is_internal),
          subscription: s.subscription,
          lead_delivery_mode: s.lead_delivery?.mode || "email",
          leadsCount: siteLeads.length
        };
      })
    );

    const commercialTotal = Math.max(0, accounts.length - internalCount);
    const activeSubscribers = payingCount + cancelingCount;
    const conversionPct =
      commercialTotal > 0 ? Math.round((activeSubscribers / commercialTotal) * 1000) / 10 : 0;

    return res.json({
      ok: true,
      metrics: {
        priceUsd: FRONTDESK_PRICE_USD,
        mrr: activeSubscribers * FRONTDESK_PRICE_USD,
        payingCount: activeSubscribers,
        trialingCount,
        graceCount,
        pastDueCount,
        pausedCount,
        compedCount,
        internalCount,
        totalAccounts: accounts.length,
        conversionPct
      },
      accounts
    });
  });

  app.post("/api/frontdesk/admin/sites/:id/action", deps.requireAdmin, async (req, res) => {
    const site = await getSiteByIdUnified(req.params.id, deps);
    if (!site) {
      return res.status(404).json({ ok: false, error: "Site not found." });
    }

    const action = String(req.body?.action || "");
    const days = Number(req.body?.days || 7);

    if (action === "extend_trial") {
      const addDays = days === 14 ? 14 : 7;
      const baseMs = Math.max(
        Date.now(),
        site.trial_ends_at ? new Date(site.trial_ends_at).getTime() : Date.now()
      );
      const nextTrialEnd = new Date(baseMs + addDays * 24 * 60 * 60 * 1000).toISOString();
      const nextGraceEnd = new Date(new Date(nextTrialEnd).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
      site.is_trial = true;
      site.trial_ends_at = nextTrialEnd;
      site.grace_ends_at = nextGraceEnd;
      site.status = "active";
      site.subscription = {
        ...(site.subscription || { status: "trialing" }),
        status: "trialing",
        pause_reason: null
      };
      await saveSiteUnified(site, deps);
      return res.json({ ok: true, action, site });
    }

    if (action === "comp") {
      site.is_comped = true;
      site.status = "active";
      site.subscription = { ...(site.subscription || { status: "comped" }), status: "comped", pause_reason: null };
      await saveSiteUnified(site, deps);
      return res.json({ ok: true, action, site });
    }

    if (action === "uncomp") {
      site.is_comped = false;
      site.subscription = { ...(site.subscription || { status: "trialing" }), status: site.subscription?.paypal_subscription_id ? "active" : "trialing" };
      const updated = await saveSiteUnified(site, deps);
      const ev = await evaluateSubscriptionLifecycle(updated, deps, { sendEmails: false });
      return res.json({ ok: true, action, site: ev.site });
    }

    if (action === "pause") {
      site.enabled = false;
      site.status = "paused";
      site.subscription = { ...(site.subscription || { status: "paused" }), status: "paused", pause_reason: "admin_paused" };
      await saveSiteUnified(site, deps);
      return res.json({ ok: true, action, site });
    }

    if (action === "resume") {
      site.enabled = true;
      site.status = "active";
      if (!site.is_internal) {
        const nextStatus: SubscriptionStatus = site.is_comped
          ? "comped"
          : site.subscription?.paypal_subscription_id
          ? "active"
          : "trialing";
        site.subscription = { ...(site.subscription || { status: nextStatus }), status: nextStatus, pause_reason: null };
      }
      await saveSiteUnified(site, deps);
      return res.json({ ok: true, action, site });
    }

    if (action === "resend_login") {
      if (!site.contact_email) {
        return res.status(400).json({ ok: false, error: "Site does not have a contact_email." });
      }
      const magic = issueMagicLoginToken(site.contact_email, site.id, req);
      const sent = await sendMagicLinkEmail(site.contact_email, [site.business_name], magic.url, deps.getResend);
      return res.json({ ok: sent.success, action, emailSent: sent.success, error: sent.error });
    }

    return res.status(400).json({ ok: false, error: `Unsupported admin action "${action}".` });
  });
}
