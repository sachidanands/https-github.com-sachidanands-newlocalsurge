import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Globe,
  Mail,
  RefreshCw,
  Save,
  Send,
  Webhook,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchSiteLeads, sendTestLead, updatePortalSettings } from './api';
import type { DetectedForm, FrontdeskLead, LeadDeliveryMode, PortalSite } from './types';

interface LeadsTabProps {
  site: PortalSite;
  onSiteUpdated: (site: PortalSite) => void;
}

export default function LeadsTab({ site, onSiteUpdated }: LeadsTabProps) {
  const initial = site.lead_delivery || { mode: 'email' as LeadDeliveryMode };
  const detectedForms = initial.detected_forms || [];

  const [mode, setMode] = useState<LeadDeliveryMode>(initial.mode || 'email');
  const [notifyEmail, setNotifyEmail] = useState(
    initial.notify_email || site.contact_email || ''
  );

  // Endpoint state
  const [endpointUrl, setEndpointUrl] = useState(initial.endpoint?.url || '');
  const [endpointFormat, setEndpointFormat] = useState<'json' | 'form'>(
    initial.endpoint?.format === 'form' ? 'form' : 'json'
  );
  const [endpointHeadersText, setEndpointHeadersText] = useState(
    initial.endpoint?.headers && Object.keys(initial.endpoint.headers).length > 0
      ? JSON.stringify(initial.endpoint.headers, null, 2)
      : ''
  );
  const [epNameKey, setEpNameKey] = useState(initial.endpoint?.field_map?.name || 'name');
  const [epEmailKey, setEpEmailKey] = useState(initial.endpoint?.field_map?.email || 'email');
  const [epPhoneKey, setEpPhoneKey] = useState(initial.endpoint?.field_map?.phone || 'phone');
  const [epMessageKey, setEpMessageKey] = useState(initial.endpoint?.field_map?.message || 'message');

  // Form auto-fill state
  const [formPageUrl, setFormPageUrl] = useState(
    initial.form?.page_url || site.website_url || ''
  );
  const [formSelector, setFormSelector] = useState(initial.form?.form_selector || '');
  const [submitSelector, setSubmitSelector] = useState(initial.form?.submit_selector || '');
  const [formAutoSubmit, setFormAutoSubmit] = useState(Boolean(initial.form?.auto_submit));
  const [formHasCaptcha, setFormHasCaptcha] = useState(Boolean(initial.form?.has_captcha));
  const [fmName, setFmName] = useState(initial.form?.field_map?.name || '');
  const [fmEmail, setFmEmail] = useState(initial.form?.field_map?.email || '');
  const [fmPhone, setFmPhone] = useState(initial.form?.field_map?.phone || '');
  const [fmMessage, setFmMessage] = useState(initial.form?.field_map?.message || '');

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResultText, setTestResultText] = useState<string | null>(null);

  // Captured leads
  const [leads, setLeads] = useState<FrontdeskLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetchSiteLeads(site.id);
      if (res.ok && res.leads) {
        setLeads(res.leads);
      }
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [site.id]);

  const applyDetectedForm = (df: DetectedForm) => {
    setFormPageUrl(df.page_url);
    setFormSelector(df.form_selector);
    setSubmitSelector(df.submit_selector || '');
    setFormHasCaptcha(Boolean(df.has_captcha));
    if (df.has_captcha) {
      setFormAutoSubmit(false);
    }
    const mapByKey: Record<string, string> = {};
    for (const f of df.fields) {
      if (f.key && f.selector) mapByKey[f.key] = f.selector;
    }
    setFmName(mapByKey.name || '');
    setFmEmail(mapByKey.email || '');
    setFmPhone(mapByKey.phone || '');
    setFmMessage(mapByKey.message || '');
    setMode('form');
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    let parsedHeaders: Record<string, string> = {};
    if (mode === 'endpoint' && endpointHeadersText.trim()) {
      try {
        const obj = JSON.parse(endpointHeadersText);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
          setSaveMessage({ ok: false, text: 'Custom headers must be a JSON object (e.g. {"x-api-key": "..."}).' });
          setSaving(false);
          return;
        }
        for (const [k, v] of Object.entries(obj)) {
          parsedHeaders[String(k)] = String(v);
        }
      } catch {
        setSaveMessage({ ok: false, text: 'Invalid JSON in Custom Headers.' });
        setSaving(false);
        return;
      }
    }

    const payload: Record<string, unknown> = {
      lead_delivery: {
        mode,
        notify_email: notifyEmail.trim(),
        ...(mode === 'endpoint' || endpointUrl.trim()
          ? {
              endpoint: {
                url: endpointUrl.trim(),
                method: 'POST',
                format: endpointFormat,
                headers: parsedHeaders,
                field_map: {
                  name: epNameKey.trim() || 'name',
                  email: epEmailKey.trim() || 'email',
                  phone: epPhoneKey.trim() || 'phone',
                  message: epMessageKey.trim() || 'message'
                }
              }
            }
          : {}),
        ...(mode === 'form' || formSelector.trim()
          ? {
              form: {
                page_url: formPageUrl.trim(),
                form_selector: formSelector.trim(),
                submit_selector: submitSelector.trim() || undefined,
                auto_submit: formHasCaptcha ? false : formAutoSubmit,
                has_captcha: formHasCaptcha,
                field_map: {
                  ...(fmName.trim() ? { name: fmName.trim() } : {}),
                  ...(fmEmail.trim() ? { email: fmEmail.trim() } : {}),
                  ...(fmPhone.trim() ? { phone: fmPhone.trim() } : {}),
                  ...(fmMessage.trim() ? { message: fmMessage.trim() } : {})
                }
              }
            }
          : {})
      }
    };

    try {
      const res = await updatePortalSettings(site.id, payload);
      if (!res.ok || !res.site) {
        setSaveMessage({ ok: false, text: res.error || 'Could not save delivery settings.' });
      } else {
        onSiteUpdated(res.site);
        setSaveMessage({ ok: true, text: 'Lead delivery settings saved.' });
      }
    } catch {
      setSaveMessage({ ok: false, text: 'Network error saving delivery settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestLead = async () => {
    setTesting(true);
    setTestResultText(null);
    try {
      const res = await sendTestLead(site.id);
      if (!res.ok) {
        setTestResultText(res.error || 'Test delivery failed.');
      } else {
        const emailStatus = res.result?.email?.ok
          ? 'Email: Sent'
          : `Email: ${res.result?.email?.error || 'Skipped'}`;
        const epStatus = res.result?.endpoint
          ? res.result.endpoint.ok
            ? `Webhook: 200 OK (${res.result.endpoint.attempts || 1} attempt)`
            : `Webhook failed: ${res.result.endpoint.error || 'Error'}`
          : '';
        setTestResultText([emailStatus, epStatus].filter(Boolean).join(' · '));
      }
    } catch {
      setTestResultText('Network error while sending test lead.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Delivery Configuration */}
      <form
        onSubmit={handleSaveDelivery}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Lead Delivery Mode</h2>
            <p className="text-sm text-slate-500">
              Choose where leads captured by your AI chatbot should go. Every lead is always saved in your dashboard below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestLead}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            {testing ? 'Sending Test...' : 'Send Test Lead'}
          </button>
        </div>

        {testResultText && (
          <div className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-medium">
            {testResultText}
          </div>
        )}

        {/* Email Always Active / Notification Input */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Instant Notification Email
          </label>
          <input
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="owner@yourbusiness.com"
            className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123e35]/20"
          />
          <p className="text-xs text-slate-500 mt-1">
            Receive an email copy of each captured lead (even when using Endpoint or Form Auto-Fill).
          </p>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              mode === 'email'
                ? 'border-[#123e35] bg-emerald-50/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
              <Mail className="w-4 h-4 text-[#123e35]" />
              Email & Dashboard
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recommended for most sites. Instant email alert + CSV export.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('endpoint')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              mode === 'endpoint'
                ? 'border-[#123e35] bg-emerald-50/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
              <Webhook className="w-4 h-4 text-[#123e35]" />
              Custom Endpoint
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              POST every lead via JSON or form-encoded HTTP to Zapier, Make, n8n, or your API.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('form')}
            className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
              mode === 'form'
                ? 'border-[#123e35] bg-emerald-50/40'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
              <Globe className="w-4 h-4 text-[#123e35]" />
              Auto-Fill Site Form
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              No backend API? Fills & submits your existing contact form right in the visitor&apos;s browser.
            </p>
          </button>
        </div>

        {/* Mode Specific Config: Endpoint */}
        {mode === 'endpoint' && (
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/60">
            <h3 className="text-sm font-bold text-slate-900">Webhook Endpoint Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1">POST Endpoint URL</label>
                <input
                  type="url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Payload Format</label>
                <select
                  value={endpointFormat}
                  onChange={(e) => setEndpointFormat(e.target.value === 'form' ? 'form' : 'json')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                >
                  <option value="json">application/json</option>
                  <option value="form">application/x-www-form-urlencoded</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Name Field Key</label>
                <input
                  type="text"
                  value={epNameKey}
                  onChange={(e) => setEpNameKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Email Field Key</label>
                <input
                  type="text"
                  value={epEmailKey}
                  onChange={(e) => setEpEmailKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Phone Field Key</label>
                <input
                  type="text"
                  value={epPhoneKey}
                  onChange={(e) => setEpPhoneKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Message Field Key</label>
                <input
                  type="text"
                  value={epMessageKey}
                  onChange={(e) => setEpMessageKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Optional Custom Headers (JSON)
              </label>
              <textarea
                rows={2}
                value={endpointHeadersText}
                onChange={(e) => setEndpointHeadersText(e.target.value)}
                placeholder='{"Authorization": "Bearer your-token"}'
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Mode Specific Config: Form Auto-Fill */}
        {mode === 'form' && (
          <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Website Contact Form Auto-Fill</h3>
                <p className="text-xs text-slate-500">
                  Works on forms located on the same origin ({site.website_url || 'your website'}).
                </p>
              </div>
            </div>

            {detectedForms.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detected Forms from Site Scan ({detectedForms.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detectedForms.map((df, i) => (
                    <button
                      type="button"
                      key={`${df.form_selector}-${i}`}
                      onClick={() => applyDetectedForm(df)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        formSelector === df.form_selector
                          ? 'border-[#123e35] bg-emerald-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 truncate">{df.form_selector}</div>
                      <div className="text-slate-500 truncate mt-0.5">{df.page_url}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {df.fields.length} mapped fields
                        </span>
                        {df.has_captcha && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                            CAPTCHA detected
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formHasCaptcha && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>CAPTCHA detected on this form.</strong> We never bypass CAPTCHAs, so auto-submit is disabled for this form. For automatic delivery without manual clicks, switch to <strong>Email & Dashboard</strong> or <strong>Custom Endpoint</strong>.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Form Page URL</label>
                <input
                  type="url"
                  value={formPageUrl}
                  onChange={(e) => setFormPageUrl(e.target.value)}
                  placeholder="https://yoursite.com/contact"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Form CSS Selector</label>
                <input
                  type="text"
                  value={formSelector}
                  onChange={(e) => setFormSelector(e.target.value)}
                  placeholder="#contact-form"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Submit Button Selector</label>
                <input
                  type="text"
                  value={submitSelector}
                  onChange={(e) => setSubmitSelector(e.target.value)}
                  placeholder='button[type="submit"]'
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Name Selector</label>
                <input
                  type="text"
                  value={fmName}
                  onChange={(e) => setFmName(e.target.value)}
                  placeholder='input[name="name"]'
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Email Selector</label>
                <input
                  type="text"
                  value={fmEmail}
                  onChange={(e) => setFmEmail(e.target.value)}
                  placeholder='input[name="email"]'
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Phone Selector</label>
                <input
                  type="text"
                  value={fmPhone}
                  onChange={(e) => setFmPhone(e.target.value)}
                  placeholder='input[name="phone"]'
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Message Selector</label>
                <input
                  type="text"
                  value={fmMessage}
                  onChange={(e) => setFmMessage(e.target.value)}
                  placeholder='textarea[name="message"]'
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formHasCaptcha ? false : formAutoSubmit}
                disabled={formHasCaptcha}
                onChange={(e) => setFormAutoSubmit(e.target.checked)}
                className="rounded border-slate-300"
              />
              Automatically click the submit button after filling fields (unchecked = fill only)
            </label>
          </div>
        )}

        {saveMessage && (
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border ${
              saveMessage.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {saveMessage.ok ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {saveMessage.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123e35] hover:bg-[#0d2d26] text-white text-sm font-bold cursor-pointer disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Delivery Settings'}
        </button>
      </form>

      {/* Captured Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Captured Leads ({leads.length})
            </h2>
            <p className="text-sm text-slate-500">
              Visitors who shared their contact details inside your chatbot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadLeads}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href={`/api/frontdesk/portal/sites/${encodeURIComponent(site.id)}/leads.csv`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </a>
          </div>
        </div>

        {loadingLeads ? (
          <div className="py-10 text-center text-sm text-slate-500">Loading captured leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
            No leads captured yet. Once visitors submit their info in the chat widget, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-4">Date</th>
                  <th className="py-2.5 pr-4">Visitor</th>
                  <th className="py-2.5 pr-4">Contact</th>
                  <th className="py-2.5 pr-4">Inquiry</th>
                  <th className="py-2.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leads.map((lead) => {
                  const isOpen = expandedLeadId === lead.id;
                  return (
                    <React.Fragment key={lead.id}>
                      <tr className="hover:bg-slate-50/70">
                        <td className="py-3 pr-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 pr-4 font-bold text-slate-900">
                          {lead.customer_name || 'Website Visitor'}
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-600 space-y-0.5">
                          {lead.customer_email && <div>{lead.customer_email}</div>}
                          {lead.customer_phone && <div className="text-slate-500">{lead.customer_phone}</div>}
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-600 max-w-xs truncate">
                          {lead.issue_description || '—'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setExpandedLeadId(isOpen ? null : lead.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#123e35] hover:underline cursor-pointer"
                          >
                            {isOpen ? (
                              <>
                                Hide <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                Transcript <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="bg-slate-50 px-4 py-4">
                            <div className="space-y-2 text-xs">
                              {lead.service_address && (
                                <div className="text-slate-600">
                                  <strong>Address / Location:</strong> {lead.service_address}
                                </div>
                              )}
                              <div className="text-slate-600">
                                <strong>Full Notes:</strong> {lead.issue_description || '—'}
                              </div>
                              {lead.transcript && lead.transcript.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5 max-h-56 overflow-y-auto">
                                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                                    Chat Transcript
                                  </div>
                                  {lead.transcript.map((m, idx) => (
                                    <div key={idx} className="leading-relaxed">
                                      <span className="font-bold text-slate-800">
                                        {m.role === 'user' ? 'Visitor' : 'Bot'}:
                                      </span>{' '}
                                      <span className="text-slate-700">{m.content}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
