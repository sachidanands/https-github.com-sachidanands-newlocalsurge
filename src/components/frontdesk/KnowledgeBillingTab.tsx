import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Save,
  ShieldCheck
} from 'lucide-react';
import {
  cancelPaypalSubscribe,
  rescanSite,
  startPaypalSubscribe,
  updatePortalSettings
} from './api';
import type { PortalSite } from './types';

interface KnowledgeBillingTabProps {
  site: PortalSite;
  onSiteUpdated: (site: PortalSite) => void;
  paypalFeedback?: { type: 'success' | 'info' | 'error'; message: string } | null;
}

export default function KnowledgeBillingTab({
  site,
  onSiteUpdated,
  paypalFeedback
}: KnowledgeBillingTabProps) {
  const knowledge = site.scraped_knowledge || {};
  const [customNotes, setCustomNotes] = useState(knowledge.customNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesMsg, setNotesMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [rescanning, setRescanning] = useState(false);
  const [rescanMsg, setRescanMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [confirmCancelStep, setConfirmCancelStep] = useState(false);

  const lastCrawledDate = site.last_crawled_at
    ? new Date(site.last_crawled_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'Not recorded';

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    setNotesMsg(null);
    try {
      const res = await updatePortalSettings(site.id, { customNotes });
      if (!res.ok || !res.site) {
        setNotesMsg({ ok: false, text: res.error || 'Could not save notes.' });
      } else {
        onSiteUpdated(res.site);
        setNotesMsg({ ok: true, text: 'Extra business notes saved for your chatbot.' });
      }
    } catch {
      setNotesMsg({ ok: false, text: 'Network error saving notes.' });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRescan = async () => {
    setRescanning(true);
    setRescanMsg(null);
    try {
      const res = await rescanSite(site.id);
      if (!res.ok) {
        const nextTxt = res.nextAllowedAt
          ? ` Next scan allowed after ${new Date(res.nextAllowedAt).toLocaleString()}.`
          : '';
        setRescanMsg({
          ok: false,
          text: `${res.error || 'Could not re-scan site.'}${nextTxt}`
        });
      } else if (res.site) {
        onSiteUpdated(res.site);
        setRescanMsg({
          ok: true,
          text: `Scanned ${res.pagesScraped?.length || 1} page(s) successfully.`
        });
      }
    } catch {
      setRescanMsg({ ok: false, text: 'Network error while re-scanning website.' });
    } finally {
      setRescanning(false);
    }
  };

  const handleSubscribePaypal = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await startPaypalSubscribe(site.id);
      if (!res.ok || !res.approveUrl) {
        setBillingError(res.error || 'Could not start PayPal checkout.');
        setBillingLoading(false);
        return;
      }
      window.location.href = res.approveUrl;
    } catch {
      setBillingError('Network error starting PayPal checkout.');
      setBillingLoading(false);
    }
  };

  const handleCancelPaypal = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const res = await cancelPaypalSubscribe(site.id);
      if (!res.ok || !res.site) {
        setBillingError(res.error || 'Could not cancel subscription.');
      } else {
        onSiteUpdated(res.site);
        setConfirmCancelStep(false);
      }
    } catch {
      setBillingError('Network error canceling subscription.');
    } finally {
      setBillingLoading(false);
    }
  };

  const status = site.subscription.status;
  const isPaid = status === 'active';
  const isCanceling = status === 'canceling';
  const needsUpgrade = ['trialing', 'grace', 'paused', 'past_due'].includes(status);

  return (
    <div className="space-y-6">
      {paypalFeedback && (
        <div
          className={`rounded-2xl border px-5 py-4 flex items-center gap-3 text-sm font-semibold ${
            paypalFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : paypalFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
        >
          {paypalFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{paypalFeedback.message}</span>
        </div>
      )}

      {/* PayPal Subscription Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#123e35] mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Subscription & PayPal Billing
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              AI FrontDesk — ${site.monthlyPriceUsd || 5}/month
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Includes website scanning, Q&amp;A answers, lead capture, analytics, and custom branding.
            </p>
          </div>

          <div className="shrink-0">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                isPaid || status === 'comped'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'grace' || status === 'past_due' || status === 'paused'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Status: {status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Plan
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {status === 'comped'
                ? 'Complimentary Access ($0/mo)'
                : isPaid || isCanceling
                ? `AI FrontDesk ($${site.monthlyPriceUsd || 5}/mo via PayPal)`
                : '30-Day Free Trial ($0)'}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isPaid || isCanceling ? 'Next / Period End' : 'Trial Ends'}
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {isPaid || isCanceling
                ? site.subscription.current_period_end
                  ? new Date(site.subscription.current_period_end).toLocaleDateString()
                  : 'Monthly Recurring'
                : site.trial_ends_at
                ? new Date(site.trial_ends_at).toLocaleDateString()
                : '—'}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Widget Visibility
            </div>
            <div className="font-bold text-slate-900 mt-0.5">
              {site.widgetVisible ? 'Live on Your Website' : 'Paused / Hidden'}
            </div>
          </div>
        </div>

        {billingError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
            {billingError}
          </div>
        )}

        {!site.billingConfigured && needsUpgrade && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900 leading-relaxed">
            <strong>PayPal checkout is not enabled on this server yet.</strong> Your 30-day free trial and all chatbot settings remain active while PayPal credentials are finalized.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {needsUpgrade && (
            <button
              type="button"
              disabled={!site.billingConfigured || billingLoading}
              onClick={handleSubscribePaypal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm font-extrabold cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {billingLoading
                ? 'Redirecting to PayPal...'
                : `Subscribe for $${site.monthlyPriceUsd || 5}/mo with PayPal`}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {isPaid && !confirmCancelStep && (
            <button
              type="button"
              onClick={() => setConfirmCancelStep(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
            >
              Cancel Subscription
            </button>
          )}

          {isPaid && confirmCancelStep && (
            <div className="flex flex-wrap items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs">
              <span className="font-bold text-red-800">
                Cancel PayPal auto-renewal?
              </span>
              <button
                type="button"
                disabled={billingLoading}
                onClick={handleCancelPaypal}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold cursor-pointer disabled:opacity-60"
              >
                {billingLoading ? 'Canceling...' : 'Yes, Cancel Plan'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancelStep(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Keep Plan
              </button>
            </div>
          )}

          {isCanceling && (
            <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              Cancellation scheduled — your chatbot stays live until{' '}
              {site.subscription.current_period_end
                ? new Date(site.subscription.current_period_end).toLocaleDateString()
                : 'the end of your billing cycle'}
              .
            </div>
          )}
        </div>
      </div>

      {/* Knowledge Base & Re-scan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Website Knowledge
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Learned Content ({site.website_url || 'No URL'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Last scanned: {lastCrawledDate}</p>
          </div>

          <button
            type="button"
            disabled={rescanning || !site.website_url}
            onClick={handleRescan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rescanning ? 'animate-spin' : ''}`} />
            {rescanning ? 'Scanning Website...' : 'Re-scan Website (1/day)'}
          </button>
        </div>

        {rescanMsg && (
          <div
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${
              rescanMsg.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {rescanMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="font-bold text-slate-700 mb-2">
              Services Detected ({knowledge.primaryServices?.length || 0})
            </div>
            {knowledge.primaryServices && knowledge.primaryServices.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {knowledge.primaryServices.slice(0, 10).map((srv, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No specific services indexed yet.</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="font-bold text-slate-700 mb-2">
              Service Areas & FAQs ({knowledge.faqs?.length || 0} FAQs)
            </div>
            <p className="text-slate-600 leading-relaxed">
              {knowledge.serviceAreas && knowledge.serviceAreas.length > 0
                ? `Areas: ${knowledge.serviceAreas.slice(0, 6).join(', ')}`
                : 'General website Q&A active.'}
            </p>
            <p className="text-slate-500 mt-1">
              Contact forms detected: {site.lead_delivery.detected_forms?.length || 0}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveNotes} className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-1">
              Extra Notes, Hours & FAQs for Your Chatbot
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Add anything not shown on your homepage (pricing ranges, holiday hours, booking rules, promo codes).
            </p>
            <textarea
              rows={4}
              maxLength={2000}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Example: Free 15-minute phone consultations Monday–Friday 9am–5pm. Same-week appointments available."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123e35]/20"
            />
          </div>

          {notesMsg && (
            <div
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                notesMsg.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {notesMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingNotes}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123e35] hover:bg-[#0d2d26] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {savingNotes ? 'Saving...' : 'Save Extra Notes'}
          </button>
        </form>
      </div>
    </div>
  );
}
