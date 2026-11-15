import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  Code2,
  Home,
  Inbox,
  LogOut,
  Mail,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  confirmPaypalSubscribe,
  fetchPortalMe,
  logoutPortal,
  requestMagicLink,
  verifyMagicToken
} from './api';
import HomeTab, { type DashboardTabId } from './HomeTab';
import AnalyticsTab from './AnalyticsTab';
import InstallTab from './InstallTab';
import AppearanceTab from './AppearanceTab';
import LeadsTab from './LeadsTab';
import KnowledgeBillingTab from './KnowledgeBillingTab';
import type { PortalSite } from './types';

interface FrontdeskDashboardProps {
  onBackToLanding?: () => void;
}

const TABS: Array<{ id: DashboardTabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'install', label: 'Install', icon: Code2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'leads', label: 'Leads', icon: Inbox },
  { id: 'billing', label: 'Knowledge & Billing', icon: BookOpen }
];

export default function FrontdeskDashboard({ onBackToLanding }: FrontdeskDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [sites, setSites] = useState<PortalSite[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DashboardTabId>('home');
  const [authBanner, setAuthBanner] = useState<string | null>(null);
  const [paypalFeedback, setPaypalFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Magic link recovery login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [linkResult, setLinkResult] = useState<{
    found?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const magicToken = params.get('token');
      const paypalStatus = params.get('paypal');
      const paypalSubId = params.get('subscription_id') || params.get('ba_token');
      const siteParam = params.get('siteId');

      if (magicToken) {
        const verified = await verifyMagicToken(magicToken);
        if (!active) return;
        if (!verified.ok) {
          setAuthBanner(
            verified.error || 'That login link expired or was already used. Request a fresh link below.'
          );
        }
        window.history.replaceState({}, '', '/ai-frontdesk/dashboard');
      } else if (paypalStatus || siteParam) {
        window.history.replaceState({}, '', '/ai-frontdesk/dashboard');
      }

      const me = await fetchPortalMe();
      if (!active) return;

      if (me.ok && me.authenticated && me.sites) {
        setAuthenticated(true);
        setOwnerEmail(me.email || null);
        setSites(me.sites);
        const preferred =
          (siteParam && me.sites.find((s) => s.id === siteParam)?.id) ||
          me.sites[0]?.id ||
          '';
        setActiveSiteId(preferred);

        if (paypalStatus === 'success' && preferred) {
          setActiveTab('billing');
          const confirmed = await confirmPaypalSubscribe(preferred, paypalSubId || undefined);
          if (!active) return;
          if (confirmed.ok && confirmed.site) {
            setSites((prev) =>
              prev.map((s) => (s.id === confirmed.site!.id ? confirmed.site! : s))
            );
            setPaypalFeedback({
              type: 'success',
              message: 'Your $5/month AI FrontDesk PayPal subscription is active!'
            });
          } else {
            setPaypalFeedback({
              type: 'info',
              message:
                confirmed.error ||
                'PayPal checkout finished. Activation usually completes within seconds.'
            });
          }
        } else if (paypalStatus === 'cancel') {
          setActiveTab('billing');
          setPaypalFeedback({
            type: 'info',
            message: 'PayPal checkout was canceled. You were not charged.'
          });
        }
      } else {
        setAuthenticated(false);
        setSites([]);
      }

      setLoading(false);
    }

    bootstrap().catch(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingLink(true);
    setLinkResult(null);
    try {
      const res = await requestMagicLink(loginEmail.trim());
      setLinkResult({
        found: res.found,
        message: res.message,
        error: res.ok ? undefined : res.error || 'Could not send login link.'
      });
    } catch {
      setLinkResult({ error: 'Network error. Please try again.' });
    } finally {
      setSendingLink(false);
    }
  };

  const handleLogout = async () => {
    await logoutPortal();
    setAuthenticated(false);
    setOwnerEmail(null);
    setSites([]);
    setActiveSiteId('');
  };

  const handleSiteUpdated = (updated: PortalSite) => {
    setSites((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || null;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f9f9f6] px-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#123e35] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading AI FrontDesk Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !activeSite) {
    return (
      <div className="min-h-[80vh] bg-[#f9f9f6] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#123e35] text-white flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">AI FrontDesk Sign In</h1>
            <p className="text-sm text-slate-500">
              Lost or deleted your welcome email? Enter the email you used for your free trial to get a fresh 30-minute login link.
            </p>
          </div>

          {authBanner && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-semibold text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{authBanner}</span>
            </div>
          )}

          <form onSubmit={handleRequestLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Business Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@yourbusiness.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123e35]/20"
              />
            </div>

            <button
              type="submit"
              disabled={sendingLink}
              className="w-full py-3 px-4 rounded-xl bg-[#123e35] hover:bg-[#0d2d26] text-white text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              {sendingLink ? 'Checking & Sending...' : 'Email Me a Login Link'}
            </button>
          </form>

          {linkResult && (
            <div
              className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                linkResult.error || linkResult.found === false
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-start gap-2">
                {linkResult.found ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                )}
                <div className="space-y-1">
                  <p>{linkResult.error || linkResult.message}</p>
                  {linkResult.found === false && (
                    <a
                      href="/ai-frontdesk#try-free-trial"
                      className="inline-flex items-center gap-1 font-extrabold text-[#123e35] underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Start your 30-day free trial instead
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <a
              href="/ai-frontdesk"
              onClick={(e) => {
                if (onBackToLanding) {
                  e.preventDefault();
                  onBackToLanding();
                }
              }}
              className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-[#123e35]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              AI FrontDesk Overview
            </a>
            <a href="/ai-frontdesk#try-free-trial" className="font-bold text-[#bc5f40] hover:underline">
              New 30-Day Free Trial
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f6] pb-20">
      {/* Top Portal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123e35] text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">{activeSite.business_name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeSite.widgetVisible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {activeSite.widgetVisible ? 'Widget Visible' : 'Widget Hidden'}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {activeSite.website_url || activeSite.id} · Signed in as {ownerEmail}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {sites.length > 1 && (
              <select
                value={activeSite.id}
                onChange={(e) => setActiveSiteId(e.target.value)}
                aria-label="Select chatbot site"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.business_name}
                  </option>
                ))}
              </select>
            )}

            <a
              href="/ai-frontdesk"
              onClick={(e) => {
                if (onBackToLanding) {
                  e.preventDefault();
                  onBackToLanding();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              FrontDesk Home
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  isActive
                    ? 'border-[#123e35] text-[#123e35]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'home' && (
          <HomeTab
            site={activeSite}
            onSiteUpdated={handleSiteUpdated}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab siteId={activeSite.id} />}
        {activeTab === 'install' && <InstallTab site={activeSite} />}
        {activeTab === 'appearance' && (
          <AppearanceTab site={activeSite} onSiteUpdated={handleSiteUpdated} />
        )}
        {activeTab === 'leads' && (
          <LeadsTab site={activeSite} onSiteUpdated={handleSiteUpdated} />
        )}
        {activeTab === 'billing' && (
          <KnowledgeBillingTab
            site={activeSite}
            onSiteUpdated={handleSiteUpdated}
            paypalFeedback={paypalFeedback}
          />
        )}
      </div>
    </div>
  );
}
