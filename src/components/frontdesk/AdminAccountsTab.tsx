import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Mail,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  Users
} from 'lucide-react';
import type { SiteSubscription, SubscriptionStatus } from './types';

interface AdminAccountRow {
  id: string;
  business_name: string;
  website_url?: string;
  contact_name?: string;
  contact_email?: string;
  created_at: string;
  installed_at?: string | null;
  last_seen_at?: string | null;
  trial_ends_at?: string | null;
  enabled: boolean;
  widgetVisible: boolean;
  is_comped?: boolean;
  is_internal?: boolean;
  subscription: SiteSubscription;
  lead_delivery_mode: string;
  leadsCount: number;
}

interface AdminMetrics {
  priceUsd: number;
  mrr: number;
  payingCount: number;
  trialingCount: number;
  graceCount: number;
  pastDueCount: number;
  pausedCount: number;
  compedCount: number;
  internalCount: number;
  totalAccounts: number;
  conversionPct: number;
}

const STATUS_FILTERS: Array<{ value: 'all' | SubscriptionStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active ($5)' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'grace', label: 'Grace' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'paused', label: 'Paused' },
  { value: 'comped', label: 'Comped' },
  { value: 'internal', label: 'Internal' }
];

function badgeClass(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
    case 'comped':
      return 'bg-emerald-100 text-emerald-800';
    case 'trialing':
      return 'bg-blue-100 text-blue-800';
    case 'grace':
    case 'past_due':
    case 'paused':
      return 'bg-red-100 text-red-800';
    case 'canceling':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-slate-200 text-slate-700';
  }
}

export default function AdminAccountsTab() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [accounts, setAccounts] = useState<AdminAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busySiteId, setBusySiteId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [search, setSearch] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    const token = sessionStorage.getItem('adminToken') || '';
    try {
      const resp = await fetch('/api/frontdesk/admin/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        setError(data.error || 'Could not load AI FrontDesk accounts.');
      } else {
        setMetrics(data.metrics);
        setAccounts(data.accounts || []);
      }
    } catch {
      setError('Network error loading AI FrontDesk accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const runAction = async (
    siteId: string,
    action: 'extend_trial' | 'comp' | 'uncomp' | 'pause' | 'resume' | 'resend_login',
    days?: 7 | 14
  ) => {
    setBusySiteId(siteId);
    setToast(null);
    const token = sessionStorage.getItem('adminToken') || '';
    try {
      const resp = await fetch(`/api/frontdesk/admin/sites/${encodeURIComponent(siteId)}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, days })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        setToast(`Action failed: ${data.error || 'Unknown error'}`);
      } else {
        setToast(
          action === 'resend_login'
            ? `Magic login link emailed to site ${siteId}.`
            : `Updated ${siteId} (${action.replace('_', ' ')}).`
        );
        await fetchAccounts();
      }
    } catch {
      setToast('Network error running admin action.');
    } finally {
      setBusySiteId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (statusFilter !== 'all' && a.subscription?.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (a.business_name || '').toLowerCase().includes(q) ||
        (a.website_url || '').toLowerCase().includes(q) ||
        (a.contact_email || '').toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
  }, [accounts, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>AI FrontDesk MRR</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              ${metrics.mrr}
              <span className="text-sm font-semibold text-slate-400">/mo</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.payingCount} active subscriber(s) × ${metrics.priceUsd}/mo
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Trial → Paid</span>
              <CheckCircle2 className="w-4 h-4 text-[#123e35]" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">{metrics.conversionPct}%</div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.totalAccounts - metrics.internalCount} commercial site(s)
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>In Trial / Grace</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {metrics.trialingCount}
              <span className="text-sm font-bold text-amber-600 ml-2">
                +{metrics.graceCount} grace
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.pastDueCount} past due via PayPal
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Paused / Comped</span>
              <Users className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {metrics.pausedCount}
              <span className="text-sm font-bold text-emerald-700 ml-2">
                · {metrics.compedCount} comped
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {metrics.internalCount} internal showcase site(s)
            </div>
          </div>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[#123e35] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business, domain, email..."
                className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs w-60"
              />
            </div>
            <button
              type="button"
              onClick={fetchAccounts}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {toast && (
          <div className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold">
            {toast}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-4">Business & Site</th>
                <th className="py-2.5 pr-4">Owner Email</th>
                <th className="py-2.5 pr-4">Status</th>
                <th className="py-2.5 pr-4">Trial / Period</th>
                <th className="py-2.5 pr-4">Install & Delivery</th>
                <th className="py-2.5 pr-4">Leads</th>
                <th className="py-2.5 text-right">Owner Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((acc) => {
                const st = (acc.subscription?.status || 'trialing') as SubscriptionStatus;
                const isBusy = busySiteId === acc.id;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-slate-900">{acc.business_name}</div>
                      <div className="text-slate-500 truncate max-w-[200px]">
                        {acc.website_url || acc.id}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{acc.contact_email || '—'}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${badgeClass(
                          st
                        )}`}
                      >
                        {st}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {acc.widgetVisible ? 'Visible' : 'Hidden'}
                        {acc.enabled === false ? ' (Off)' : ''}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                      {st === 'active' || st === 'canceling'
                        ? acc.subscription.current_period_end
                          ? `Bill: ${new Date(acc.subscription.current_period_end).toLocaleDateString()}`
                          : 'PayPal Active'
                        : acc.trial_ends_at
                        ? `Ends: ${new Date(acc.trial_ends_at).toLocaleDateString()}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      <div>{acc.last_seen_at ? 'Installed ✓' : 'Pending install'}</div>
                      <div className="text-[11px] text-slate-400 uppercase">
                        Mode: {acc.lead_delivery_mode}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-bold text-slate-900">{acc.leadsCount}</td>
                    <td className="py-3 text-right">
                      {acc.is_internal ? (
                        <span className="text-[11px] font-semibold text-slate-400">Protected</span>
                      ) : (
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => runAction(acc.id, 'extend_trial', 7)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                          >
                            +7d
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => runAction(acc.id, acc.is_comped ? 'uncomp' : 'comp')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-800 cursor-pointer disabled:opacity-50"
                          >
                            <Gift className="w-3 h-3" />
                            {acc.is_comped ? 'Uncomp' : 'Comp'}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              runAction(acc.id, acc.enabled === false || st === 'paused' ? 'resume' : 'pause')
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 font-bold text-amber-800 cursor-pointer disabled:opacity-50"
                          >
                            {acc.enabled === false || st === 'paused' ? (
                              <>
                                <PlayCircle className="w-3 h-3" /> Resume
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3 h-3" /> Pause
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || !acc.contact_email}
                            onClick={() => runAction(acc.id, 'resend_login')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 font-bold text-blue-800 cursor-pointer disabled:opacity-50"
                          >
                            <Mail className="w-3 h-3" /> Link
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching AI FrontDesk accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
