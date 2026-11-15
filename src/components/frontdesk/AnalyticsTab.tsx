import React, { useEffect, useState } from 'react';
import {
  Clock,
  HelpCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { fetchSiteAnalytics } from './api';
import type { FrontdeskAnalyticsSummary } from './types';

interface AnalyticsTabProps {
  siteId: string;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function DeltaBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="text-[11px] font-semibold text-slate-400">Baseline period</span>;
  }
  const positive = pct >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
        positive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {positive ? `+${pct}%` : `${pct}%`} vs prior
    </span>
  );
}

export default function AnalyticsTab({ siteId }: AnalyticsTabProps) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<FrontdeskAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSiteAnalytics(siteId, days)
      .then((res) => {
        if (active && res.ok && res.analytics) {
          setData(res.analytics);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [siteId, days]);

  const series = data?.series || [];
  const maxConvos = Math.max(1, ...series.map((d) => Math.max(d.conversations, d.leads)));
  const maxDuration = Math.max(10, ...series.map((d) => d.avgSessionSeconds));
  const maxHourly = Math.max(1, ...(data?.hourlyActivity || []).map((h) => h.conversations));

  const chartW = 720;
  const chartH = 210;
  const padL = 32;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const leadLinePoints =
    series.length > 0
      ? series
          .map((d, i) => {
            const x = padL + ((i + 0.5) / series.length) * innerW;
            const y = padT + innerH - (d.leads / maxConvos) * innerH;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ')
      : '';

  return (
    <div className="space-y-6">
      {/* Header + Window Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#151716]">Engagement &amp; Lead Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            See how many visitors interact with your chatbot, time spent chatting, and leads captured.
          </p>
        </div>

        <div className="inline-flex bg-white border border-[#dfded4] p-1 rounded-xl self-start">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                days === d ? 'bg-[#123e35] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Conversations</span>
            <MessageSquare className="w-4 h-4 text-[#123e35]" />
          </div>
          <div className="text-3xl font-black text-[#151716]">
            {loading && !data ? '...' : data?.totals.conversations ?? 0}
          </div>
          <DeltaBadge pct={data?.deltasPct.conversations ?? null} />
        </div>

        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Leads Captured</span>
            <Users className="w-4 h-4 text-[#bc5f40]" />
          </div>
          <div className="text-3xl font-black text-[#bc5f40]">
            {loading && !data ? '...' : data?.totals.leads ?? 0}
          </div>
          <DeltaBadge pct={data?.deltasPct.leads ?? null} />
        </div>

        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Avg Time Spent</span>
            <Clock className="w-4 h-4 text-[#123e35]" />
          </div>
          <div className="text-3xl font-black text-[#151716]">
            {loading && !data ? '...' : formatDuration(data?.totals.avgSessionSeconds ?? 0)}
          </div>
          <DeltaBadge pct={data?.deltasPct.avgSessionSeconds ?? null} />
        </div>

        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Lead Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {loading && !data ? '...' : `${data?.totals.conversionRate ?? 0}%`}
          </div>
          <DeltaBadge pct={data?.deltasPct.conversionRate ?? null} />
        </div>
      </div>

      {/* Secondary Funnel Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-[#dfded4] rounded-2xl p-4 text-center">
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500">Widget Loads</div>
          <div className="text-lg font-black text-[#151716]">{data?.totals.widgetLoads ?? 0}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500">Chat Opens</div>
          <div className="text-lg font-black text-[#151716]">{data?.totals.widgetOpens ?? 0}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500">Visitor Messages</div>
          <div className="text-lg font-black text-[#151716]">{data?.totals.messages ?? 0}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500">Form Auto-Fills</div>
          <div className="text-lg font-black text-[#151716]">{data?.totals.formSubmits ?? 0}</div>
        </div>
      </div>

      {/* Main Combo Chart: Daily Conversations & Leads */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#151716]">Daily Conversations &amp; Leads</h3>
            <p className="text-xs text-slate-500">Hover any day to inspect activity</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 text-[#123e35]">
              <span className="w-3 h-3 rounded bg-[#123e35]" /> Conversations
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#bc5f40]">
              <span className="w-3 h-3 rounded-full bg-[#bc5f40]" /> Leads Captured
            </span>
          </div>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="w-full h-56 overflow-visible"
            role="img"
            aria-label="Daily conversations and leads chart"
          >
            {/* Horizontal grid lines */}
            {[0, 0.5, 1].map((t) => {
              const y = padT + innerH * (1 - t);
              const val = Math.round(maxConvos * t);
              return (
                <g key={t}>
                  <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#e7e5dd" strokeDasharray="3 3" />
                  <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Conversation Bars */}
            {series.map((d, i) => {
              const slotW = innerW / Math.max(1, series.length);
              const barW = Math.max(3, Math.min(20, slotW * 0.65));
              const x = padL + i * slotW + (slotW - barW) / 2;
              const h = (d.conversations / maxConvos) * innerH;
              const y = padT + innerH - h;
              const isHovered = hoverIdx === i;
              return (
                <g
                  key={d.date}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  className="cursor-pointer"
                >
                  <rect x={padL + i * slotW} y={padT} width={slotW} height={innerH} fill="transparent" />
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(2, h)}
                    rx={3}
                    fill={isHovered ? '#10b981' : '#123e35'}
                    opacity={d.conversations === 0 ? 0.2 : 0.9}
                  />
                </g>
              );
            })}

            {/* Leads Line + Dots */}
            {leadLinePoints && (
              <polyline
                fill="none"
                stroke="#bc5f40"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={leadLinePoints}
              />
            )}
            {series.map((d, i) => {
              const slotW = innerW / Math.max(1, series.length);
              const cx = padL + (i + 0.5) * slotW;
              const cy = padT + innerH - (d.leads / maxConvos) * innerH;
              if (d.leads === 0 && hoverIdx !== i) return null;
              return (
                <circle
                  key={`dot_${d.date}`}
                  cx={cx}
                  cy={cy}
                  r={hoverIdx === i ? 5 : 3.5}
                  fill="#bc5f40"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Date Axis Labels (Start / Mid / End) */}
            {series.length > 0 &&
              [0, Math.floor(series.length / 2), series.length - 1].map((idx) => {
                const item = series[idx];
                if (!item) return null;
                const x = padL + ((idx + 0.5) / series.length) * innerW;
                return (
                  <text key={`lbl_${idx}`} x={x} y={chartH - 6} textAnchor="middle" fontSize="10" fill="#64748b">
                    {item.date.slice(5)}
                  </text>
                );
              })}
          </svg>

          {hoverIdx !== null && series[hoverIdx] && (
            <div className="mt-2 px-3 py-2 rounded-xl bg-[#f7f6f2] border border-[#dfded4] text-xs flex flex-wrap items-center gap-4 text-[#151716]">
              <strong>{series[hoverIdx].date}</strong>
              <span>Chats: <strong>{series[hoverIdx].conversations}</strong></span>
              <span>Leads: <strong className="text-[#bc5f40]">{series[hoverIdx].leads}</strong></span>
              <span>Widget Opens: <strong>{series[hoverIdx].opens}</strong></span>
              <span>Avg Time Spent: <strong>{formatDuration(series[hoverIdx].avgSessionSeconds)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Charts & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avg Time Visitors Spend & Hourly Distribution */}
        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-black text-[#151716]">Visitor Time Spent Per Day</h3>
          <svg viewBox="0 0 360 110" className="w-full h-28" role="img" aria-label="Time spent chart">
            {series.map((d, i) => {
              const slotW = 340 / Math.max(1, series.length);
              const bw = Math.max(2, slotW * 0.65);
              const h = (d.avgSessionSeconds / maxDuration) * 80;
              return (
                <rect
                  key={`dur_${d.date}`}
                  x={10 + i * slotW}
                  y={90 - h}
                  width={bw}
                  height={Math.max(2, h)}
                  rx={2}
                  fill="#0ea5e9"
                  opacity={d.avgSessionSeconds > 0 ? 0.85 : 0.2}
                >
                  <title>{`${d.date}: ${formatDuration(d.avgSessionSeconds)}`}</title>
                </rect>
              );
            })}
          </svg>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Busiest Chat Hours (UTC)</h4>
            <svg viewBox="0 0 360 70" className="w-full h-16" role="img" aria-label="Hourly activity chart">
              {(data?.hourlyActivity || []).map((h, i) => {
                const slotW = 340 / 24;
                const bh = (h.conversations / maxHourly) * 44;
                return (
                  <g key={h.hour}>
                    <rect
                      x={10 + i * slotW}
                      y={50 - bh}
                      width={slotW - 3}
                      height={Math.max(2, bh)}
                      rx={2}
                      fill={h.conversations === maxHourly && h.conversations > 0 ? '#bc5f40' : '#123e35'}
                      opacity={h.conversations > 0 ? 0.85 : 0.15}
                    >
                      <title>{`${String(h.hour).padStart(2, '0')}:00 UTC - ${h.conversations} chats`}</title>
                    </rect>
                    {i % 6 === 0 && (
                      <text x={10 + i * slotW} y={64} fontSize="9" fill="#64748b">
                        {String(h.hour).padStart(2, '0')}h
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Top Questions + Smart Highlights */}
        <div className="bg-white border border-[#dfded4] rounded-2xl p-5 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#bc5f40]" />
              <h3 className="text-base font-black text-[#151716]">Top Visitor Questions</h3>
            </div>
            {data?.topQuestions && data.topQuestions.length > 0 ? (
              <div className="space-y-2.5">
                {data.topQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#151716] truncate pr-3">{q.question}</span>
                      <span className="font-bold text-[#123e35] shrink-0">{q.count}x</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#123e35] rounded-full"
                        style={{
                          width: `${Math.max(15, Math.round((q.count / Math.max(1, data.topQuestions[0].count)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No visitor questions recorded in this period yet. Once visitors chat, their top questions will appear here automatically.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#123e35]">
              <Sparkles className="w-4 h-4 text-[#bc5f40]" />
              <span>Highlights</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {(data?.highlights || []).map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#bc5f40] font-black">&bull;</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
