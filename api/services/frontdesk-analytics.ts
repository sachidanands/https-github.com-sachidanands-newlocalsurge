import fs from "fs";
import path from "path";
import type {
  FrontdeskAnalyticsSummary,
  FrontdeskEvent,
  FrontdeskEventType,
  FrontdeskLead
} from "../../src/types/frontdesk";

const MAX_LOCAL_EVENTS = 20000;
const VALID_TYPES = new Set<FrontdeskEventType>([
  "load",
  "open",
  "message",
  "lead",
  "session_end",
  "form_submit"
]);

function getEventsFilePath(): string {
  const dir = process.env.VERCEL ? "/tmp/data" : path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, "frontdesk_events.json");
}

function readLocalEvents(): FrontdeskEvent[] {
  try {
    const file = getEventsFilePath();
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events: FrontdeskEvent[]): void {
  try {
    const file = getEventsFilePath();
    const capped = events.slice(0, MAX_LOCAL_EVENTS);
    fs.writeFileSync(file, JSON.stringify(capped, null, 2));
  } catch (err) {
    console.warn("⚠️ Failed to write local frontdesk_events.json:", err);
  }
}

function sanitizeEventMeta(meta: unknown): Record<string, unknown> {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const obj = meta as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj).slice(0, 8)) {
    const safeKey = String(k).replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 40);
    if (!safeKey) continue;
    if (typeof v === "string") {
      cleaned[safeKey] = v.replace(/[\x00-\x1F\x7F]/g, " ").trim().slice(0, 180);
    } else if (typeof v === "number" || typeof v === "boolean") {
      cleaned[safeKey] = v;
    }
  }
  return cleaned;
}

export async function recordFrontdeskEvent(
  params: {
    siteId: string;
    sessionId?: string | null;
    type: FrontdeskEventType;
    value?: number | null;
    meta?: Record<string, unknown> | null;
    createdAt?: string;
  },
  supabase?: any
): Promise<boolean> {
  if (!params.siteId || !VALID_TYPES.has(params.type)) return false;

  const numericValue =
    params.value !== null && params.value !== undefined && Number.isFinite(Number(params.value))
      ? Math.max(0, Math.min(3600, Math.round(Number(params.value) * 100) / 100))
      : null;

  const eventRow: FrontdeskEvent = {
    site_id: String(params.siteId).trim().slice(0, 100),
    session_id: params.sessionId ? String(params.sessionId).trim().slice(0, 100) : null,
    type: params.type,
    value: numericValue,
    meta: sanitizeEventMeta(params.meta),
    created_at: params.createdAt || new Date().toISOString()
  };

  if (supabase) {
    try {
      const { error } = await supabase.from("frontdesk_events").insert([eventRow]);
      if (!error) {
        return true;
      }
      if (error.code !== "42P01" && error.code !== "PGRST205") {
        console.warn("⚠️ Supabase frontdesk_events insert error:", error.message || error);
      }
    } catch {
      // Fallback to local JSON
    }
  }

  const local = readLocalEvents();
  local.unshift(eventRow);
  writeLocalEvents(local);
  return true;
}

export async function fetchSiteEventsSince(
  siteId: string,
  sinceIso: string,
  supabase?: any
): Promise<FrontdeskEvent[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("frontdesk_events")
        .select("id, site_id, session_id, type, value, meta, created_at")
        .eq("site_id", siteId)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true })
        .limit(10000);

      if (!error && Array.isArray(data)) {
        return data as FrontdeskEvent[];
      }
    } catch {
      // Fallback to local JSON
    }
  }

  const sinceMs = new Date(sinceIso).getTime();
  return readLocalEvents()
    .filter((e) => e.site_id === siteId && new Date(e.created_at).getTime() >= sinceMs)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

function calcDeltaPct(curr: number, prev: number): number | null {
  if (curr === 0 && prev === 0) return null;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function aggregateWindow(events: FrontdeskEvent[], leadsFallbackCount = 0) {
  let widgetLoads = 0;
  let widgetOpens = 0;
  let messages = 0;
  let leadEvents = 0;
  let formSubmits = 0;
  let sessionSum = 0;
  let sessionCount = 0;
  const convoSessions = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (ev.type === "load") widgetLoads++;
    else if (ev.type === "open") widgetOpens++;
    else if (ev.type === "message") {
      messages++;
      convoSessions.add(ev.session_id || `anon_msg_${i}`);
    } else if (ev.type === "lead") {
      leadEvents++;
      if (ev.session_id) convoSessions.add(ev.session_id);
    } else if (ev.type === "form_submit") {
      formSubmits++;
    } else if (ev.type === "session_end" && typeof ev.value === "number" && ev.value > 0) {
      sessionSum += ev.value;
      sessionCount++;
    }
  }

  const leads = Math.max(leadEvents, leadsFallbackCount);
  const conversations = Math.max(convoSessions.size, messages > 0 ? 1 : 0, leads);
  const avgSessionSeconds = sessionCount > 0 ? Math.round(sessionSum / sessionCount) : 0;
  const conversionRate = conversations > 0 ? Math.round((leads / conversations) * 1000) / 10 : 0;

  return {
    widgetLoads,
    widgetOpens,
    conversations,
    messages,
    leads,
    formSubmits,
    avgSessionSeconds,
    conversionRate
  };
}

export async function getFrontdeskAnalytics(params: {
  siteId: string;
  days: number;
  leads?: FrontdeskLead[];
  supabase?: any;
}): Promise<FrontdeskAnalyticsSummary> {
  const days = [7, 30, 90].includes(params.days) ? params.days : 30;
  const now = new Date();
  const currentStartMs = now.getTime() - days * 24 * 60 * 60 * 1000;
  const prevStartMs = now.getTime() - days * 2 * 24 * 60 * 60 * 1000;

  const allEvents = await fetchSiteEventsSince(params.siteId, new Date(prevStartMs).toISOString(), params.supabase);

  const currentEvents: FrontdeskEvent[] = [];
  const prevEvents: FrontdeskEvent[] = [];
  for (const ev of allEvents) {
    const t = new Date(ev.created_at).getTime();
    if (t >= currentStartMs) currentEvents.push(ev);
    else if (t >= prevStartMs) prevEvents.push(ev);
  }

  const siteLeads = (params.leads || []).filter((l) => l.site_id === params.siteId);
  const currLeadFallback = siteLeads.filter((l) => new Date(l.created_at).getTime() >= currentStartMs).length;
  const prevLeadFallback = siteLeads.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return t >= prevStartMs && t < currentStartMs;
  }).length;

  const totals = aggregateWindow(currentEvents, currLeadFallback);
  const prevRaw = aggregateWindow(prevEvents, prevLeadFallback);
  const previousTotals = {
    widgetLoads: prevRaw.widgetLoads,
    widgetOpens: prevRaw.widgetOpens,
    conversations: prevRaw.conversations,
    leads: prevRaw.leads,
    avgSessionSeconds: prevRaw.avgSessionSeconds,
    conversionRate: prevRaw.conversionRate
  };

  // Daily series (continuous dates across `days`)
  const dayBuckets = new Map<
    string,
    {
      loads: number;
      opens: number;
      convoSessions: Set<string>;
      leads: number;
      sessionSum: number;
      sessionCount: number;
    }
  >();

  for (let d = days - 1; d >= 0; d--) {
    const dateStr = new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    dayBuckets.set(dateStr, {
      loads: 0,
      opens: 0,
      convoSessions: new Set(),
      leads: 0,
      sessionSum: 0,
      sessionCount: 0
    });
  }

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    convoSessions: new Set<string>(),
    leads: 0
  }));

  const questionCounts = new Map<string, { display: string; count: number }>();

  for (let i = 0; i < currentEvents.length; i++) {
    const ev = currentEvents[i];
    const d = new Date(ev.created_at);
    const key = d.toISOString().slice(0, 10);
    const bucket = dayBuckets.get(key);
    const hBucket = hourly[d.getUTCHours()];

    if (ev.type === "load") {
      if (bucket) bucket.loads++;
    } else if (ev.type === "open") {
      if (bucket) bucket.opens++;
    } else if (ev.type === "message") {
      const sid = ev.session_id || `m_${i}`;
      if (bucket) bucket.convoSessions.add(sid);
      hBucket.convoSessions.add(sid);

      const qRaw = typeof ev.meta?.question === "string" ? ev.meta.question.trim() : "";
      if (qRaw.length >= 4 && !/^\d+$/.test(qRaw)) {
        const norm = qRaw.toLowerCase().replace(/\s+/g, " ");
        const existing = questionCounts.get(norm);
        if (existing) {
          existing.count++;
        } else {
          questionCounts.set(norm, { display: qRaw.slice(0, 110), count: 1 });
        }
      }
    } else if (ev.type === "lead") {
      if (bucket) bucket.leads++;
      hBucket.leads++;
    } else if (ev.type === "session_end" && typeof ev.value === "number" && ev.value > 0) {
      if (bucket) {
        bucket.sessionSum += ev.value;
        bucket.sessionCount++;
      }
    }
  }

  // Ensure leads stored prior to event tracking also appear in daily series
  for (const lead of siteLeads) {
    const key = new Date(lead.created_at).toISOString().slice(0, 10);
    const bucket = dayBuckets.get(key);
    if (bucket && bucket.leads === 0) {
      // Only top up if no lead event recorded on that day when falling back
      const hasLeadEventOnDay = currentEvents.some(
        (ev) => ev.type === "lead" && ev.created_at.slice(0, 10) === key
      );
      if (!hasLeadEventOnDay) {
        bucket.leads++;
      }
    }
  }

  const series = Array.from(dayBuckets.entries()).map(([date, b]) => ({
    date,
    loads: b.loads,
    opens: b.opens,
    conversations: Math.max(b.convoSessions.size, b.leads),
    leads: b.leads,
    avgSessionSeconds: b.sessionCount > 0 ? Math.round(b.sessionSum / b.sessionCount) : 0
  }));

  const hourlyActivity = hourly.map((h) => ({
    hour: h.hour,
    conversations: Math.max(h.convoSessions.size, h.leads),
    leads: h.leads
  }));

  const topQuestions = Array.from(questionCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((q) => ({ question: q.display, count: q.count }));

  const deltasPct = {
    conversations: calcDeltaPct(totals.conversations, previousTotals.conversations),
    leads: calcDeltaPct(totals.leads, previousTotals.leads),
    avgSessionSeconds: calcDeltaPct(totals.avgSessionSeconds, previousTotals.avgSessionSeconds),
    conversionRate: calcDeltaPct(totals.conversionRate, previousTotals.conversionRate)
  };

  const highlights: string[] = [];
  if (totals.conversations > 0) {
    const peakHour = hourlyActivity.reduce(
      (best, cur) => (cur.conversations > best.conversations ? cur : best),
      hourlyActivity[0]
    );
    const nextHour = (peakHour.hour + 1) % 24;
    const fmt = (h: number) => `${String(h).padStart(2, "0")}:00 UTC`;
    highlights.push(`Peak visitor chat window: ${fmt(peakHour.hour)} – ${fmt(nextHour)}.`);
  }
  if (deltasPct.leads !== null && deltasPct.leads !== 0) {
    highlights.push(
      `${deltasPct.leads > 0 ? "+" : ""}${deltasPct.leads}% change in captured leads vs. the prior ${days}-day period.`
    );
  }
  if (topQuestions.length > 0) {
    highlights.push(`Most asked question: "${topQuestions[0].question}" (${topQuestions[0].count}x).`);
  }
  if (highlights.length === 0) {
    highlights.push("Install the 1-line script on your website to start tracking live visitor chats and leads.");
  }

  return {
    days,
    totals,
    previousTotals,
    deltasPct,
    series,
    hourlyActivity,
    topQuestions,
    highlights
  };
}
