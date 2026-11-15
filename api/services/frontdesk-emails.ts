import type { FrontdeskSite } from "../../src/types/frontdesk";

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanHeaderLine(text: string, maxLen = 180): string {
  if (!text) return "";
  return String(text).replace(/[\r\n]+/g, " ").trim().slice(0, maxLen);
}

function sanitizeEmailHref(url: string): string {
  if (!url || typeof url !== "string") return "https://localsurgeseo.com/ai-frontdesk/dashboard";
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return escapeHtml(trimmed);
    }
  } catch {
    // ignore
  }
  return "https://localsurgeseo.com/ai-frontdesk/dashboard";
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return "soon";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "soon";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildEmailShell(title: string, badge: string, headerBg: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px 12px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);">
    <div style="background: ${headerBg}; padding: 24px 28px; color: #ffffff;">
      <div style="display: inline-block; background: rgba(255,255,255,0.16); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 10px;">
        ${escapeHtml(badge)}
      </div>
      <h1 style="margin: 0; font-size: 21px; font-weight: 800; line-height: 1.3;">${escapeHtml(title)}</h1>
    </div>
    <div style="padding: 26px 28px; color: #334155; font-size: 14px; line-height: 1.6;">
      ${bodyHtml}
    </div>
    <div style="background: #f1f5f9; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
      LocalSurge AI FrontDesk &bull; 30-Day Free Trial, then $5/mo &bull; localsurgeseo.com
    </div>
  </div>
</body>
</html>`;
}

async function sendViaResend(
  resendGetter: () => Promise<any>,
  params: { to: string; subject: string; html: string; bccAdmin?: boolean }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = await resendGetter();
  if (!resend) {
    return { success: false, error: "Resend client not configured" };
  }

  try {
    const payload: Record<string, any> = {
      from: "Local Surge SEO <contact@localsurgeseo.com>",
      to: [params.to],
      subject: cleanHeaderLine(params.subject),
      html: params.html
    };
    if (params.bccAdmin && process.env.ADMIN_EMAIL) {
      payload.bcc = [process.env.ADMIN_EMAIL];
    }
    const res = await resend.emails.send(payload);
    if (res?.error) {
      return { success: false, error: res.error.message || "Resend error" };
    }
    return { success: true, id: res?.data?.id || "sent" };
  } catch (err: any) {
    return { success: false, error: err?.message || "Email send exception" };
  }
}

export async function sendSaasWelcomeEmail(
  site: FrontdeskSite,
  magicLinkUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email on site" };

  const scriptTag = `<script src="https://localsurgeseo.com/widget.js" data-site-id="${site.id}" defer></script>`;
  const expiryDate = formatShortDate(site.trial_ends_at);
  const bName = escapeHtml(site.business_name);
  const safeMagic = sanitizeEmailHref(magicLinkUrl);

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>Your <strong>30-day free trial</strong> of AI FrontDesk for <strong>${bName}</strong> is live. We're scanning <strong>${escapeHtml(site.website_url || "your website")}</strong> now so your assistant can answer visitor questions and capture leads right away.</p>

    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeMagic}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 13px 26px; border-radius: 10px; font-size: 15px;">
        Open Your AI FrontDesk Dashboard &rarr;
      </a>
      <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">This one-click sign-in link expires in 30 minutes. You can request a fresh link anytime at localsurgeseo.com/ai-frontdesk.</p>
    </div>

    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; color: #065f46; font-size: 13px;">
      <strong>No card needed today:</strong> Your chatbot stays free through <strong>${escapeHtml(expiryDate)}</strong>. Keep it live after day 30 for just <strong>$5/month</strong> via PayPal, or it pauses automatically — zero surprise charges.
    </div>

    <h3 style="font-size: 14px; color: #0f172a; margin: 20px 0 8px 0;">Your 1-Line Install Snippet</h3>
    <div style="background: #0f172a; color: #38bdf8; padding: 13px; border-radius: 8px; font-family: monospace; font-size: 12.5px; word-break: break-all;">
      ${escapeHtml(scriptTag)}
    </div>
    <p style="font-size: 13px; color: #475569; margin-top: 10px;">Paste this just before <code>&lt;/body&gt;</code> on WordPress, Wix, Shopify, Squarespace, Webflow, or plain HTML, then customize your brand color, icon, and lead delivery mode inside your dashboard.</p>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `Your AI FrontDesk Chatbot is Ready (${site.business_name})`,
    html: buildEmailShell(`Welcome to AI FrontDesk`, `30-Day Free Trial`, `#123e35`, body),
    bccAdmin: true
  });
}

export async function sendMagicLinkEmail(
  email: string,
  businessNames: string[],
  magicLinkUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const safeUrl = sanitizeEmailHref(magicLinkUrl);
  const label = businessNames.length > 0 ? businessNames.slice(0, 3).map(escapeHtml).join(", ") : "your AI FrontDesk account";

  const body = `
    <p style="margin-top: 0;">Here is your one-click sign-in link for <strong>${label}</strong>.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 13px 28px; border-radius: 10px; font-size: 15px;">
        Sign In to AI FrontDesk Dashboard &rarr;
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b;">For security, this link works once and expires in 30 minutes. After you click it, you'll stay signed in on this browser for 30 days.</p>
    <p style="font-size: 12px; color: #94a3b8;">If you didn't request this link, you can safely ignore this email.</p>
  `;

  return sendViaResend(resendGetter, {
    to: email,
    subject: `Sign in to your AI FrontDesk Dashboard`,
    html: buildEmailShell(`Sign In to AI FrontDesk`, `Magic Login Link`, `#123e35`, body)
  });
}

export async function sendTrialCountdownEmail(
  site: FrontdeskSite,
  daysRemaining: 7 | 3 | 0,
  stats: { leads: number; conversations: number },
  dashboardLoginUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);
  const bName = escapeHtml(site.business_name);

  let title = `${daysRemaining} days left in your AI FrontDesk trial`;
  let badge = `${daysRemaining} Days Left`;
  let headerBg = `#123e35`;
  let leadPara = `Your 30-day free trial for <strong>${bName}</strong> wraps up on <strong>${formatShortDate(site.trial_ends_at)}</strong>.`;

  if (daysRemaining === 3) {
    badge = `3 Days Left`;
    headerBg = `#9a3412`;
  } else if (daysRemaining === 0) {
    title = `Your 30-day free trial ended today (3-day grace active)`;
    badge = `Day 30 Grace Period`;
    headerBg = `#9a3412`;
    leadPara = `Your 30-day free trial for <strong>${bName}</strong> completed today. Your chatbot stays live for a <strong>3-day courtesy grace period</strong> (through ${formatShortDate(site.grace_ends_at)}) so you don't lose visitors while you subscribe.`;
  }

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>${leadPara}</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Visitor Chats</div>
        <div style="font-size: 26px; font-weight: 800; color: #123e35;">${stats.conversations}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Leads Captured</div>
        <div style="font-size: 26px; font-weight: 800; color: #bc5f40;">${stats.leads}</div>
      </div>
    </div>

    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #bc5f40; color: #ffffff; text-decoration: none; font-weight: 700; padding: 13px 26px; border-radius: 10px; font-size: 15px;">
        Keep Chatbot Live for $5/mo (PayPal) &rarr;
      </a>
      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Flat $5/month &bull; Cancel anytime in 1 click &bull; No surprise charges.</p>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: daysRemaining === 0 ? `Your AI FrontDesk trial ended (3-day grace active)` : `${daysRemaining} days left in your AI FrontDesk trial (${site.business_name})`,
    html: buildEmailShell(title, badge, headerBg, body),
    bccAdmin: daysRemaining === 0
  });
}

export async function sendTrialPausedEmail(
  site: FrontdeskSite,
  dashboardLoginUrl: string,
  reason: "trial_expired" | "payment_failed" | "canceled",
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);
  const bName = escapeHtml(site.business_name);

  const reasonText =
    reason === "payment_failed"
      ? "your recent $5/mo PayPal subscription payment could not be processed after the 3-day grace period"
      : reason === "canceled"
      ? "your billing period ended after cancellation"
      : "your 30-day free trial and 3-day courtesy grace period concluded";

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>We've automatically paused the AI FrontDesk chat bubble on <strong>${escapeHtml(site.website_url || bName)}</strong> because ${reasonText}.</p>
    <p>All of your settings, website knowledge, custom colors, and captured leads remain safely saved in your dashboard. Reactivate anytime for <strong>$5/month</strong> via PayPal and your widget will reappear right away with zero code changes.</p>

    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 13px 26px; border-radius: 10px; font-size: 15px;">
        Reactivate AI FrontDesk for $5/mo &rarr;
      </a>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `AI FrontDesk paused on ${site.business_name} — Reactivate anytime for $5/mo`,
    html: buildEmailShell(`Chatbot Paused for ${site.business_name}`, `Account Paused`, `#334155`, body)
  });
}

export async function sendSubscriptionActivatedEmail(
  site: FrontdeskSite,
  dashboardLoginUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>Thank you! Your <strong>AI FrontDesk ($5/month)</strong> PayPal subscription for <strong>${escapeHtml(site.business_name)}</strong> is now active.</p>
    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 16px; margin: 16px 0; font-size: 13px; color: #065f46;">
      <strong>Plan:</strong> AI FrontDesk Standalone &mdash; $5.00 USD / month<br/>
      <strong>Next billing date:</strong> ${escapeHtml(formatShortDate(site.subscription?.current_period_end))}<br/>
      <strong>Website:</strong> ${escapeHtml(site.website_url || "Configured in dashboard")}
    </div>
    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
        View Analytics &amp; Manage Plan &rarr;
      </a>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `Subscription active: AI FrontDesk $5/mo (${site.business_name})`,
    html: buildEmailShell(`Your AI FrontDesk Plan is Active`, `Subscription Confirmed`, `#123e35`, body),
    bccAdmin: true
  });
}

export async function sendPaymentFailedEmail(
  site: FrontdeskSite,
  dashboardLoginUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>We couldn't process your <strong>$5/month</strong> PayPal payment for <strong>${escapeHtml(site.business_name)}</strong>.</p>
    <p>Your chatbot will stay active during a <strong>3-day grace period</strong>. Please update your PayPal payment method or resubscribe in your dashboard so visitors aren't interrupted.</p>
    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #bc5f40; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
        Fix Billing in Dashboard &rarr;
      </a>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `Action needed: PayPal payment issue for AI FrontDesk (${site.business_name})`,
    html: buildEmailShell(`Payment Attention Needed`, `Past Due`, `#b91c1c`, body),
    bccAdmin: true
  });
}

export async function sendSubscriptionCanceledEmail(
  site: FrontdeskSite,
  dashboardLoginUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);

  const body = `
    <p style="margin-top: 0;">Hi ${escapeHtml(site.contact_name || "there")},</p>
    <p>Your <strong>$5/month</strong> AI FrontDesk subscription for <strong>${escapeHtml(site.business_name)}</strong> has been canceled.</p>
    <p>Your chatbot will remain active until <strong>${escapeHtml(formatShortDate(site.subscription?.current_period_end))}</strong>, and then pause automatically. You won't be billed again unless you resubscribe.</p>
    <div style="text-align: center; margin: 22px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
        Open Dashboard &rarr;
      </a>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `AI FrontDesk subscription canceled (${site.business_name})`,
    html: buildEmailShell(`Subscription Canceled`, `Cancellation Confirmed`, `#475569`, body)
  });
}

export async function sendWeeklyDigestEmail(
  site: FrontdeskSite,
  stats: { conversations: number; leads: number; avgSessionSeconds: number; conversionRate: number },
  dashboardLoginUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!site.contact_email) return { success: false, error: "No contact_email" };
  const safeUrl = sanitizeEmailHref(dashboardLoginUrl);
  const mins = Math.floor(stats.avgSessionSeconds / 60);
  const secs = stats.avgSessionSeconds % 60;
  const avgLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const body = `
    <p style="margin-top: 0;">Here is how your AI FrontDesk performed over the past 7 days for <strong>${escapeHtml(site.business_name)}</strong>:</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 18px 0;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Conversations</div>
        <div style="font-size: 22px; font-weight: 800; color: #123e35;">${stats.conversations}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Leads Captured</div>
        <div style="font-size: 22px; font-weight: 800; color: #bc5f40;">${stats.leads}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Avg Time Spent</div>
        <div style="font-size: 22px; font-weight: 800; color: #0f172a;">${escapeHtml(avgLabel)}</div>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Lead Conversion</div>
        <div style="font-size: 22px; font-weight: 800; color: #059669;">${stats.conversionRate}%</div>
      </div>
    </div>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${safeUrl}" style="display: inline-block; background: #123e35; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
        View Full Charts &amp; Top Questions &rarr;
      </a>
    </div>
  `;

  return sendViaResend(resendGetter, {
    to: site.contact_email,
    subject: `Weekly AI FrontDesk Report: ${stats.conversations} chats, ${stats.leads} leads (${site.business_name})`,
    html: buildEmailShell(`Weekly Chatbot Recap`, `7-Day Analytics`, `#123e35`, body)
  });
}
