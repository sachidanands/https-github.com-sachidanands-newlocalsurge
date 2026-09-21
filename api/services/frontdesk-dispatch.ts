import type { FrontdeskLead, FrontdeskSite } from "../../src/types/frontdesk";

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function dispatchLeadEmail(
  lead: FrontdeskLead,
  site: FrontdeskSite,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string; skipped?: boolean; reason?: string }> {
  const flags = site.feature_flags;

  // 1. Check feature flag configuration
  if (flags && flags.enableEmailDispatch === false) {
    console.log(`ℹ️ Email dispatch skipped for site "${site.id}" (Feature disabled in ${flags.planTier || 'current'} tier).`);
    return { success: true, skipped: true, reason: "Email dispatch disabled by plan tier" };
  }

  const resend = await resendGetter();
  if (!resend) {
    console.warn("⚠️ Resend client unavailable. Lead saved to database but email alert skipped.");
    return { success: false, error: "Resend client not configured" };
  }

  const targetEmail = process.env.CONTRACTOR_ALERT_EMAIL || process.env.ADMIN_EMAIL || "leads@localsurgeseo.com";
  const isEmergency = lead.urgency === "emergency";
  const isUrgent = lead.urgency === "urgent";

  const urgencyBadge = isEmergency
    ? "🚨 EMERGENCY DISPATCH (24/7)"
    : isUrgent
    ? "⚠️ HIGH PRIORITY LEAD"
    : "📋 NEW SERVICE INQUIRY";

  const urgencyColor = isEmergency ? "#dc2626" : isUrgent ? "#f59e0b" : "#10b981";

  const transcriptHtml = (lead.transcript || [])
    .map((m) => {
      const isUser = m.role === "user";
      return `
        <div style="margin-bottom: 8px; padding: 10px; border-radius: 8px; background-color: ${isUser ? '#f1f5f9' : '#e0f2fe'};">
          <strong style="color: ${isUser ? '#334155' : '#0284c7'}; font-size: 12px; text-transform: uppercase;">
            ${isUser ? '👤 Customer' : '⚡ SurgeBot'}:
          </strong>
          <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; line-height: 1.4;">
            ${escapeHtml(m.content)}
          </p>
        </div>
      `;
    })
    .join("");

  const photoHtml = (lead.photo_urls && lead.photo_urls.length > 0 && flags?.enablePhotoUpload !== false)
    ? `
      <div style="margin-top: 20px; padding: 15px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">📸 Attached Customer Photos:</h4>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${lead.photo_urls.map(url => `
            <a href="${escapeHtml(url)}" target="_blank" style="display: inline-block;">
              <img src="${escapeHtml(url)}" alt="Customer Damage Attachment" style="width: 120px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" />
            </a>
          `).join("")}
        </div>
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${urgencyBadge} - ${escapeHtml(site.business_name)}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header Banner -->
        <div style="background-color: ${urgencyColor}; color: #ffffff; padding: 18px 24px;">
          <span style="font-size: 12px; letter-spacing: 1px; font-weight: bold; text-transform: uppercase;">LocalSurge AI FrontDesk</span>
          <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800;">${urgencyBadge}</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Business: <strong>${escapeHtml(site.business_name)}</strong></p>
        </div>

        <!-- Body Content -->
        <div style="padding: 24px;">
          
          <!-- Fast Action Box -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #166534; font-size: 13px; font-weight: 600;">⚡ Speed-to-Lead Guarantee: Call customer immediately for highest conversion</p>
            <a href="tel:${escapeHtml(lead.customer_phone)}" style="display: inline-block; background: #16a34a; color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none; padding: 10px 24px; border-radius: 6px;">
              📞 Call ${escapeHtml(lead.customer_phone)}
            </a>
          </div>

          <!-- Customer Vitals Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 130px;">Customer Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${escapeHtml(lead.customer_name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Phone Number:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${escapeHtml(lead.customer_phone)}</td>
            </tr>
            ${lead.customer_email ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email Address:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${escapeHtml(lead.customer_email)}</td>
            </tr>` : ''}
            ${lead.service_address ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Service Address:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">
                <a href="https://maps.google.com/?q=${encodeURIComponent(lead.service_address)}" target="_blank" style="color: #0284c7; text-decoration: none;">
                  📍 ${escapeHtml(lead.service_address)}
                </a>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Issue Summary:</td>
              <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${escapeHtml(lead.issue_description || 'General Inquiry')}</td>
            </tr>
          </table>

          ${photoHtml}

          <!-- Chat Transcript -->
          <div style="margin-top: 24px;">
            <h4 style="margin: 0 0 12px 0; color: #334155; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              💬 Full FrontDesk Chat Transcript:
            </h4>
            ${transcriptHtml}
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          ⚡ Powered by LocalSurge AI FrontDesk • Real-Time Local Lead Capture
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "LocalSurge FrontDesk <notifications@localsurgeseo.com>",
      to: [targetEmail],
      subject: `${isEmergency ? '🚨 EMERGENCY: ' : isUrgent ? '⚠️ URGENT: ' : '📋 '} Lead for ${site.business_name} (${lead.customer_name} - ${lead.customer_phone})`,
      html
    });

    return { success: true, id: data?.data?.id || "resend_dispatched" };
  } catch (err: any) {
    console.error("❌ Resend dispatch error:", err);
    return { success: false, error: err.message || "Failed to dispatch email via Resend" };
  }
}

/**
 * Dispatches welcome email with embed script & setup steps for a new 30-day trial site
 */
export async function dispatchTrialWelcomeEmail(
  site: FrontdeskSite,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const recipientEmail = site.contact_email;
  if (!recipientEmail) {
    return { success: false, error: "No contact email provided on site" };
  }

  const resend = await resendGetter();
  if (!resend) {
    console.warn("⚠️ Resend client unavailable. Trial created but email dispatch skipped.");
    return { success: false, error: "Resend client not configured" };
  }

  const scriptTag = `<script src="https://localsurge.com/widget.js" data-site-id="${site.id}" defer></script>`;
  const expiryDate = site.trial_ends_at
    ? new Date(site.trial_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "30 days from today";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your SurgeBot 30-Day Free Trial</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px 12px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: #123e35; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
            ⚡ SurgeBot AI FrontDesk: 30-Day Free Trial
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #a7f3d0;">
            Ready to deploy for <strong>${escapeHtml(site.business_name)}</strong>
          </p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 15px; color: #1e293b; margin-top: 0; line-height: 1.5;">
            Hi ${escapeHtml(site.contact_name || "there")},
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Thank you for starting your <strong>30-day free trial</strong> of SurgeBot! Our AI crawler is actively indexing your domain (<strong>${escapeHtml(site.website_url || "")}</strong>) to learn your service policies, emergency protocols, and local coverage area.
          </p>

          <!-- Expiration Notice -->
          <div style="margin: 16px 0; padding: 12px 16px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 6px; font-size: 13px; color: #065f46;">
            <strong>✅ 30-Day Trial Active:</strong> Valid through <strong>${expiryDate}</strong>. If you decide not to continue, the chat box automatically disables itself from your website after 30 days. No surprise fees.
          </div>

          <!-- Step 1: Copy Script -->
          <h3 style="font-size: 15px; color: #0f172a; margin: 24px 0 8px 0;">Step 1: Your Custom 1-Line Embed Script</h3>
          <p style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Copy and paste this snippet into your website code:</p>
          <div style="background: #0f172a; color: #38bdf8; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 13px; word-break: break-all; line-height: 1.4;">
            ${escapeHtml(scriptTag)}
          </div>

          <!-- Step 2: Where to Add It -->
          <h3 style="font-size: 15px; color: #0f172a; margin: 24px 0 12px 0;">Step 2: Where to Add It on Your Platform</h3>
          
          <!-- Google Tag Manager / Franchise -->
          <div style="margin-bottom: 14px; padding: 12px; background: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
            <strong style="color: #065f46; font-size: 13px;">Google Tag Manager (GTM) &mdash; Zero Code &amp; Franchise Friendly:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: #047857; line-height: 1.5;">
              <li>In GTM, create a new <strong>Custom HTML</strong> tag and paste your 1-line script.</li>
              <li>Set Trigger to <strong>Page View</strong> (Window Loaded). ${site.path_prefix ? `To scope specifically to this location, add filter: <code>Page Path contains ${site.path_prefix}</code>.` : "Leave on 'All Pages' or choose specific landing pages."}</li>
              <li>Click <strong>Publish</strong>. SurgeBot will go live immediately without needing any theme code edits!</li>
            </ol>
          </div>

          <!-- WordPress -->
          <div style="margin-bottom: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #0f172a; font-size: 13px;">WordPress:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
              <li>In your WordPress dashboard, install a plugin like <strong>WPCode</strong> or <strong>Insert Headers and Footers</strong>.</li>
              <li>Navigate to <strong>Code Snippets &rarr; Header &amp; Footer</strong>.</li>
              <li>Paste the snippet in the <strong>Footer</strong> box and click <strong>Save Changes</strong>.</li>
            </ol>
          </div>

          <!-- Wix -->
          <div style="margin-bottom: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #0f172a; font-size: 13px;">Wix:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
              <li>Go to <strong>Settings &rarr; Custom Code</strong> in your Wix dashboard.</li>
              <li>Click <strong>+ Add Custom Code</strong> and paste your script.</li>
              <li>Under "Place Code in", select <strong>Body - End</strong> and click <strong>Apply</strong>.</li>
            </ol>
          </div>

          <!-- Squarespace -->
          <div style="margin-bottom: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #0f172a; font-size: 13px;">Squarespace:</strong>
            <ol style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
              <li>Go to <strong>Website &rarr; Website Tools &rarr; Code Injection</strong>.</li>
              <li>Paste the script into the <strong>Footer</strong> field and click <strong>Save</strong>.</li>
            </ol>
          </div>

          <!-- Custom HTML / Shopify -->
          <div style="margin-bottom: 14px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <strong style="color: #0f172a; font-size: 13px;">Shopify, Webflow, or Custom HTML:</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
              Open your main layout or theme file (e.g. <code>theme.liquid</code>) and paste the script tag immediately before the closing <code>&lt;/body&gt;</code> tag.
            </p>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://localsurgeseo.com/widget-test.html?siteId=${site.id}" style="display: inline-block; background: #123e35; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
              🚀 Test Your Bot Live Right Now
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
            Need help installing or want to customize your bot's answers, phone number, or brand colors? Just reply directly to this email and our engineering team will assist you!
          </p>
        </div>

        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          ⚡ LocalSurge AI FrontDesk • Real-Time Trade Lead Capture • localsurgeseo.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const emailPayload: any = {
      from: "LocalSurge FrontDesk <notifications@localsurgeseo.com>",
      to: [recipientEmail],
      subject: `🚀 Your SurgeBot 30-Day Free Trial Script for ${site.business_name}`,
      html
    };

    if (process.env.ADMIN_EMAIL) {
      emailPayload.bcc = [process.env.ADMIN_EMAIL];
    }

    const data = await resend.emails.send(emailPayload);

    console.log(`🟢 Trial onboarding email sent via Resend to ${recipientEmail}`);
    return { success: true, id: data?.data?.id || "trial_email_sent" };
  } catch (err: any) {
    console.error("❌ Resend trial welcome email error:", err);
    return { success: false, error: err.message || "Failed to dispatch trial email" };
  }
}

/**
 * Dispatches Day 30 Performance & ROI Report Email + 3-day grace period notice with $10/mo renewal link.
 */
export async function sendTrialExpiryReportEmail(
  site: any,
  stats: { totalLeads: number; emergencyLeads: number; estimatedPipelineValue: number; afterHoursLeads: number },
  checkoutUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const recipientEmail = site.contact_email;
  if (!recipientEmail) {
    return { success: false, error: "No contact email provided on site profile" };
  }

  const resend = await resendGetter();
  if (!resend) {
    console.warn("⚠️ Resend client unavailable. Expiry report email skipped.");
    return { success: false, error: "Resend client not configured" };
  }

  const graceEndsDate = site.grace_ends_at
    ? new Date(site.grace_ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "in 3 days";

  const formattedPipeline = stats.estimatedPipelineValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your 30-Day SurgeBot Results</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px 12px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: #123e35; padding: 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px;">
            30-DAY PERFORMANCE REPORT
          </div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
            📊 SurgeBot Results for ${site.business_name}
          </h1>
          <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px;">
            Your 30-day free trial has completed. Here is how your AI frontdesk performed:
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          
          <!-- ROI Metrics Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Total Leads Captured</div>
              <div style="font-size: 28px; font-weight: 900; color: #123e35; margin-top: 4px;">${stats.totalLeads}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Emergency / High Urgency</div>
              <div style="font-size: 28px; font-weight: 900; color: #bc5f40; margin-top: 4px;">${stats.emergencyLeads}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Estimated Pipeline Value</div>
              <div style="font-size: 24px; font-weight: 900; color: #059669; margin-top: 4px;">${formattedPipeline}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">After-Hours Inquiries</div>
              <div style="font-size: 28px; font-weight: 900; color: #1e293b; margin-top: 4px;">${stats.afterHoursLeads}</div>
            </div>
          </div>

          <!-- Grace Period Alert Notice -->
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
            <div style="font-weight: 800; color: #065f46; font-size: 14px; margin-bottom: 4px;">
              🟢 3-Day Courtesy Grace Period Active (Until ${graceEndsDate})
            </div>
            <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.5;">
              To make sure you don't lose any inbound jobs during this transition, SurgeBot is remaining 100% active on your site for 3 additional days.
            </p>
          </div>

          <!-- Value Proposition & CTA -->
          <div style="text-align: center; margin: 28px 0;">
            <p style="font-size: 14px; color: #334155; margin-bottom: 16px; font-weight: 600;">
              Keep 24/7 AI answering, emergency triage, and instant lead dispatches rolling for just:
            </p>
            <div style="font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 16px;">
              $10 <span style="font-size: 14px; color: #64748b; font-weight: 500;">/ month (only 33¢ a day)</span>
            </div>
            <a href="${checkoutUrl}" style="display: inline-block; background: #bc5f40; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(188,95,64,0.3);">
              ⚡ Keep SurgeBot Active for $10/mo &rarr;
            </a>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
              Cancel anytime in 1 click. Zero contracts or hidden fees.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; pt: 16px;">
            Have questions about custom CRM integration or enterprise fleet dispatches? Simply reply to this email to speak directly with our engineering team.
          </p>
        </div>

        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          ⚡ LocalSurge AI FrontDesk • Real-Time Trade Lead Capture • localsurge.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "LocalSurge FrontDesk <notifications@localsurgeseo.com>",
      to: [recipientEmail],
      bcc: [process.env.ADMIN_EMAIL || "leads@localsurgeseo.com"],
      subject: `📊 Your 30-Day SurgeBot Results: ${stats.totalLeads} Leads Captured for ${site.business_name}`,
      html
    });

    console.log(`🟢 Trial expiry ROI report email sent via Resend to ${recipientEmail}`);
    return { success: true, id: data?.data?.id || "expiry_report_sent" };
  } catch (err: any) {
    console.error("❌ Resend trial expiry ROI report email error:", err);
    return { success: false, error: err.message || "Failed to dispatch expiry report email" };
  }
}

/**
 * Dispatches Day 33 Grace Period Expired Email informing contractor that SurgeBot has switched to Fallback Direct Contact Mode.
 */
export async function sendGracePeriodEndedEmail(
  site: any,
  checkoutUrl: string,
  resendGetter: () => Promise<any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  const recipientEmail = site.contact_email;
  if (!recipientEmail) {
    return { success: false, error: "No contact email provided on site profile" };
  }

  const resend = await resendGetter();
  if (!resend) {
    console.warn("⚠️ Resend client unavailable. Grace ended email skipped.");
    return { success: false, error: "Resend client not configured" };
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SurgeBot Grace Period Concluded</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px 12px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: #1e293b; padding: 24px; text-align: center; color: #ffffff;">
          <div style="display: inline-block; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 12px; margin-bottom: 8px;">
            STATUS UPDATE: GRACE PERIOD CONCLUDED
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
            ⚠️ SurgeBot Switched to Fallback Contact Mode for ${site.business_name}
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.5; margin-top: 0;">
            The 3-day grace period for your SurgeBot 30-day free trial on <strong>${site.website_url || site.business_name}</strong> has now ended.
          </p>

          <div style="background: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px; margin: 20px 0;">
            <div style="font-weight: 700; color: #92400e; font-size: 13px; margin-bottom: 4px;">What Happens to Your Website Visitors Now:</div>
            <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
              To make sure you never miss an incoming emergency, we have switched your widget to a <strong>Direct Contact Card</strong> displaying your direct phone number with a 1-tap call button. Active 24/7 AI chat triage and instant lead qualification are paused.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin-bottom: 12px;">
              Reactivate full 24/7 AI answering & emergency dispatch in under 30 seconds:
            </p>
            <a href="${checkoutUrl}" style="display: inline-block; background: #123e35; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 15px;">
              ⚡ Reactivate SurgeBot for $10/mo &rarr;
            </a>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
              Instantly restores full AI chat triage with zero code changes required.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If you need any adjustments or want an extended review with your team, just reply directly to this email and we'll gladly help!
          </p>
        </div>

        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
          ⚡ LocalSurge AI FrontDesk • Real-Time Trade Lead Capture • localsurge.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: "LocalSurge FrontDesk <notifications@localsurgeseo.com>",
      to: [recipientEmail],
      bcc: [process.env.ADMIN_EMAIL || "leads@localsurgeseo.com"],
      subject: `⚠️ SurgeBot Grace Period Expired: AI Answering Paused for ${site.business_name}`,
      html
    });

    console.log(`🟢 Grace period expired email sent via Resend to ${recipientEmail}`);
    return { success: true, id: data?.data?.id || "grace_ended_sent" };
  } catch (err: any) {
    console.error("❌ Resend grace ended email error:", err);
    return { success: false, error: err.message || "Failed to dispatch grace ended email" };
  }
}


