import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MessageSquare,
  Palette,
  Power,
  Send,
  Sparkles,
  Users
} from 'lucide-react';
import { submitCustomUpgradeInquiry, updatePortalSettings } from './api';
import type { PortalSite } from './types';

export type DashboardTabId =
  | 'home'
  | 'analytics'
  | 'install'
  | 'appearance'
  | 'leads'
  | 'billing';

interface HomeTabProps {
  site: PortalSite;
  onSiteUpdated: (site: PortalSite) => void;
  onSwitchTab: (tab: DashboardTabId) => void;
}

function getStatusBanner(site: PortalSite): {
  label: string;
  sublabel: string;
  toneClass: string;
} {
  const st = site.subscription.status;
  if (st === 'comped') {
    return {
      label: 'Comped Plan (Active)',
      sublabel: 'Complimentary access enabled by Local Surge SEO.',
      toneClass: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    };
  }
  if (st === 'active') {
    const nextDate = site.subscription.current_period_end
      ? new Date(site.subscription.current_period_end).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Monthly autopay';
    return {
      label: 'Active ($5/month via PayPal)',
      sublabel: `Next billing date: ${nextDate}`,
      toneClass: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    };
  }
  if (st === 'canceling') {
    const endDate = site.subscription.current_period_end
      ? new Date(site.subscription.current_period_end).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'end of current period';
    return {
      label: 'Canceling at Period End',
      sublabel: `Active through ${endDate}. Reactivate anytime in Billing.`,
      toneClass: 'bg-amber-50 border-amber-200 text-amber-900'
    };
  }
  if (st === 'grace') {
    return {
      label: '3-Day Grace Period',
      sublabel: 'Your 30-day free trial ended. Subscribe for $5/mo via PayPal to keep the chat live.',
      toneClass: 'bg-amber-50 border-amber-300 text-amber-900'
    };
  }
  if (st === 'past_due') {
    return {
      label: 'Payment Attention Needed',
      sublabel: 'PayPal payment declined. Update billing within 3 days to avoid auto-pause.',
      toneClass: 'bg-red-50 border-red-200 text-red-900'
    };
  }
  if (st === 'paused') {
    return {
      label: 'Paused (Hidden on Website)',
      sublabel: 'Your widget is hidden on your site until you subscribe for $5/mo via PayPal.',
      toneClass: 'bg-slate-100 border-slate-300 text-slate-800'
    };
  }
  const daysLeft = site.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(site.trial_ends_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 30;
  return {
    label: `30-Day Free Trial (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)`,
    sublabel: 'No card needed today. Subscribe for $5/mo anytime, or it pauses after day 33.',
    toneClass: 'bg-emerald-50 border-emerald-200 text-emerald-900'
  };
}

export default function HomeTab({ site, onSiteUpdated, onSwitchTab }: HomeTabProps) {
  const [toggling, setToggling] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customGoals, setCustomGoals] = useState('');
  const [customVolume, setCustomVolume] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [customDone, setCustomDone] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const banner = getStatusBanner(site);

  const handleToggleEnabled = async () => {
    setToggling(true);
    try {
      const res = await updatePortalSettings(site.id, { enabled: !site.enabled });
      if (res.ok && res.site) {
        onSiteUpdated(res.site);
      }
    } finally {
      setToggling(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (!customGoals.trim()) {
      setCustomError('Tell us briefly what custom feature or integration you need.');
      return;
    }
    setCustomSubmitting(true);
    try {
      const res = await submitCustomUpgradeInquiry(site.id, {
        goals: customGoals.trim(),
        monthlyVolume: customVolume.trim(),
        notes: customNotes.trim()
      });
      if (!res.ok) {
        setCustomError(res.error || 'Could not submit inquiry.');
      } else {
        setCustomDone(true);
      }
    } finally {
      setCustomSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status & Master Switch */}
      <div className={`border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${banner.toneClass}`}>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
            <Clock className="w-3.5 h-3.5" />
            <span>Subscription Status</span>
          </div>
          <h2 className="text-xl font-black">{banner.label}</h2>
          <p className="text-sm opacity-90">{banner.sublabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={toggling || site.subscription.status === 'paused'}
            onClick={handleToggleEnabled}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all cursor-pointer disabled:opacity-50 ${
              site.enabled
                ? 'bg-[#123e35] text-white border-[#123e35] hover:bg-[#195347]'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{toggling ? 'Updating...' : site.enabled ? 'Chatbot: ON' : 'Chatbot: OFF'}</span>
          </button>

          {['trialing', 'grace', 'paused', 'past_due', 'canceling'].includes(site.subscription.status) && (
            <button
              type="button"
              onClick={() => onSwitchTab('billing')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#bc5f40] text-white hover:bg-[#a34f34] transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscribe $5/mo</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Snapshot + Install Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversations (30d)</div>
            <div className="text-3xl font-black text-[#123e35] mt-1">{site.stats.chats30d}</div>
            <button
              type="button"
              onClick={() => onSwitchTab('analytics')}
              className="text-xs font-bold text-[#bc5f40] hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open charts</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#123e35] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Leads Captured (30d)</div>
            <div className="text-3xl font-black text-[#bc5f40] mt-1">{site.stats.leads30d}</div>
            <button
              type="button"
              onClick={() => onSwitchTab('leads')}
              className="text-xs font-bold text-[#123e35] hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View leads &amp; delivery</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#bc5f40] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Install Status</div>
            <div className="text-lg font-black text-[#151716] mt-1">
              {site.installed_at ? 'Live on Your Site' : 'Not Detected Yet'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
              {site.last_seen_at
                ? `Last ping ${new Date(site.last_seen_at).toLocaleDateString()}`
                : 'Paste the 1-line script before </body>'}
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('install')}
              className="text-xs font-bold text-[#123e35] hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Install guide &amp; verify</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              site.installed_at ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Setup Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onSwitchTab('appearance')}
          className="text-left bg-white border border-[#dfded4] hover:border-[#123e35] rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-5 h-5 text-[#123e35]" />
            <span className="font-bold text-[#151716] group-hover:text-[#123e35]">Brand Color &amp; Icon</span>
          </div>
          <p className="text-xs text-slate-600">
            Pick your brand hex color, choose from 8 chat icons or logo URL, and edit your greeting.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSwitchTab('leads')}
          className="text-left bg-white border border-[#dfded4] hover:border-[#123e35] rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-[#bc5f40]" />
            <span className="font-bold text-[#151716] group-hover:text-[#bc5f40]">Lead Delivery Mode</span>
          </div>
          <p className="text-xs text-slate-600">
            Current mode: <strong className="uppercase">{site.lead_delivery.mode}</strong>. Route leads to email, API endpoint, or auto-fill your site form.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSwitchTab('analytics')}
          className="text-left bg-white border border-[#dfded4] hover:border-[#123e35] rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-[#123e35]" />
            <span className="font-bold text-[#151716] group-hover:text-[#123e35]">Visitor Engagement</span>
          </div>
          <p className="text-xs text-slate-600">
            Track chat volume, visitor time spent, top questions asked, and conversion rate trends.
          </p>
        </button>
      </div>

      {/* Want more from your chatbot? -> Custom Build Request */}
      <div className="bg-white border-2 border-[#123e35]/20 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#bc5f40]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Chatbot Solutions</span>
            </div>
            <h3 className="text-lg font-black text-[#151716]">Want more from your chatbot?</h3>
            <p className="text-sm text-slate-600">
              Need CRM two-way sync, WhatsApp/SMS notifications, calendar booking, multi-branch routing, or custom workflows? Tell us what you need and our team will build a tailored bot for your business.
            </p>
          </div>
          {!showCustomForm && !customDone && (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="shrink-0 px-5 py-3 rounded-xl bg-[#123e35] text-white font-bold text-sm hover:bg-[#195347] transition-colors cursor-pointer"
            >
              Request Custom Chatbot
            </button>
          )}
        </div>

        {customDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Request received! Our team will email you at <strong>{site.contact_email}</strong> with a custom build plan.
            </span>
          </div>
        )}

        {showCustomForm && !customDone && (
          <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-[#dfded4] space-y-3">
            {customError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {customError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What custom capabilities do you want? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HubSpot sync, WhatsApp alerts, booking calendar"
                  value={customGoals}
                  onChange={(e) => setCustomGoals(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated monthly leads / visitors
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 visitors / 40 leads"
                  value={customVolume}
                  onChange={(e) => setCustomVolume(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Additional details</label>
              <textarea
                rows={2}
                placeholder="Share any workflow or integration details..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={customSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#bc5f40] text-white font-bold text-sm hover:bg-[#a34f34] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{customSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
