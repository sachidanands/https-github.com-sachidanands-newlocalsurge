import type { FrontdeskAnalyticsSummary, FrontdeskLead, PortalSite } from './types';

async function parseJsonResponse(resp: Response): Promise<any> {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: text.slice(0, 140) || `HTTP ${resp.status}` };
  }
}

export async function requestMagicLink(email: string): Promise<{
  ok: boolean;
  found?: boolean;
  emailSent?: boolean;
  message?: string;
  error?: string;
}> {
  const resp = await fetch('/api/frontdesk/portal/auth/request-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  return parseJsonResponse(resp);
}

export async function verifyMagicToken(token: string): Promise<{
  ok: boolean;
  email?: string;
  siteId?: string;
  error?: string;
}> {
  const resp = await fetch('/api/frontdesk/portal/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token })
  });
  return parseJsonResponse(resp);
}

export async function logoutPortal(): Promise<void> {
  await fetch('/api/frontdesk/portal/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
}

export async function fetchPortalMe(): Promise<{
  ok: boolean;
  authenticated?: boolean;
  email?: string;
  sites?: PortalSite[];
  error?: string;
}> {
  const resp = await fetch('/api/frontdesk/portal/me', {
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function updatePortalSettings(
  siteId: string,
  patch: Record<string, unknown>
): Promise<{ ok: boolean; site?: PortalSite; error?: string }> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(patch)
  });
  return parseJsonResponse(resp);
}

export async function rescanSite(siteId: string): Promise<{
  ok: boolean;
  site?: PortalSite;
  pagesScraped?: string[];
  error?: string;
  nextAllowedAt?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/rescan`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function checkSiteInstall(siteId: string): Promise<{
  ok: boolean;
  foundOnPage?: boolean;
  installed?: boolean;
  lastSeenAt?: string | null;
  message?: string;
  error?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/check-install`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function fetchSiteAnalytics(
  siteId: string,
  days: 7 | 30 | 90
): Promise<{ ok: boolean; analytics?: FrontdeskAnalyticsSummary; error?: string }> {
  const resp = await fetch(
    `/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/analytics?days=${days}`,
    { credentials: 'include' }
  );
  return parseJsonResponse(resp);
}

export async function fetchSiteLeads(siteId: string): Promise<{
  ok: boolean;
  leads?: FrontdeskLead[];
  error?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/leads`, {
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function sendTestLead(siteId: string): Promise<{
  ok: boolean;
  result?: { email?: { ok: boolean; error?: string }; endpoint?: { ok: boolean; error?: string; attempts?: number } };
  error?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/lead-delivery/test`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function startPaypalSubscribe(siteId: string): Promise<{
  ok: boolean;
  subscriptionId?: string;
  approveUrl?: string;
  code?: string;
  error?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/billing/subscribe`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function confirmPaypalSubscribe(
  siteId: string,
  subscriptionId?: string
): Promise<{ ok: boolean; site?: PortalSite; error?: string }> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/billing/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subscriptionId })
  });
  return parseJsonResponse(resp);
}

export async function cancelPaypalSubscribe(siteId: string): Promise<{
  ok: boolean;
  site?: PortalSite;
  error?: string;
}> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/billing/cancel`, {
    method: 'POST',
    credentials: 'include'
  });
  return parseJsonResponse(resp);
}

export async function submitCustomUpgradeInquiry(
  siteId: string,
  payload: { goals: string; monthlyVolume?: string; notes?: string; phone?: string }
): Promise<{ ok: boolean; leadId?: string; error?: string }> {
  const resp = await fetch(`/api/frontdesk/portal/sites/${encodeURIComponent(siteId)}/custom-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return parseJsonResponse(resp);
}
