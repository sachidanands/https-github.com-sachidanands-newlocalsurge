/**
 * Google Analytics 4 (GA4) & Google Tag Manager (GTM) Dispatch Utility
 * 
 * Provides type-safe event tracking, asynchronous event buffering, 
 * virtual SPA pageview dispatching, and strict PII protection.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Global GA4 Measurement ID configured in index.html
export const GA_MEASUREMENT_ID = 'G-FDD0ZMHBQ7';

// In-memory event buffer in case events are triggered before gtag.js finishes loading
const eventBuffer: Array<{ name: string; params: Record<string, any> }> = [];
let isGtagReady = false;

// Poll or listen for gtag availability to flush any buffered events
if (typeof window !== 'undefined') {
  const checkGtagInterval = setInterval(() => {
    if (typeof window.gtag === 'function') {
      isGtagReady = true;
      clearInterval(checkGtagInterval);
      flushBuffer();
    }
  }, 300);

  // Stop polling after 15 seconds to conserve CPU
  setTimeout(() => clearInterval(checkGtagInterval), 15000);
}

function flushBuffer() {
  if (!isGtagReady || typeof window.gtag !== 'function') return;
  while (eventBuffer.length > 0) {
    const item = eventBuffer.shift();
    if (item) {
      try {
        window.gtag('event', item.name, item.params);
      } catch (e) {
        console.warn('Failed to flush buffered analytics event:', e);
      }
    }
  }
}

/**
 * Low-level safe dispatcher that pushes to both window.gtag and window.dataLayer
 */
export function sendEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  // 1. Push to GTM dataLayer for custom tag triggers
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
    eventTimestamp: Date.now()
  });

  // 2. Dispatch to GA4 via gtag
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (err) {
      console.warn(`Error dispatching GA4 event '${eventName}':`, err);
    }
  } else {
    // Buffer for when gtag finishes loading via requestIdleCallback
    eventBuffer.push({ name: eventName, params });
  }
}

/**
 * Dispatches a virtual pageview on SPA route changes
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;

  const path = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  const title = pageTitle || document.title || 'Local Surge SEO';
  const location = window.location.origin + path;

  // Standard GA4 page_view configuration update
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
      page_location: location
    });
  }

  sendEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: location
  });
}

export interface LeadGenerationEventData {
  planId?: string;
  planName?: string;
  industry?: string;
  location?: string;
  hasWebsite?: boolean;
  hasGBP?: boolean;
  score?: number;
  source?: string;
}

/**
 * Tracks lead conversion with strict PII sanitization (omits emails, phone numbers, contact names)
 */
export function trackLeadGeneration(data: LeadGenerationEventData) {
  sendEvent('generate_lead', {
    currency: 'USD',
    value: data.planId === 'premium' ? 1999 : data.planId === 'starter' ? 999 : 0,
    plan_id: data.planId || 'custom',
    plan_name: data.planName || 'Local Surge Onboarding',
    industry: data.industry || 'Local Business',
    location_target: data.location || 'US',
    has_website: Boolean(data.hasWebsite),
    has_gbp: Boolean(data.hasGBP),
    audit_score: typeof data.score === 'number' ? data.score : undefined,
    lead_source: data.source || 'onboarding_wizard'
  });
}

/**
 * Tracks pricing plan selection CTA clicks
 */
export function trackPlanSelection(planId: string, planName: string, price?: string) {
  sendEvent('select_item', {
    item_list_name: 'Pricing Plans',
    items: [
      {
        item_id: planId,
        item_name: planName,
        price: price ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0 : undefined,
        item_category: 'Local SEO Package'
      }
    ]
  });
}

export interface ToolAuditEventData {
  toolType: string;
  targetDomain: string;
  score?: number;
  strategy?: 'mobile' | 'desktop';
  cached?: boolean;
}

/**
 * Tracks interactive tool and diagnostic audits (PageSpeed, AI SEO Audit, Micro-Tools)
 */
export function trackToolAudit(data: ToolAuditEventData) {
  // Strip protocols, paths, and query params from domain for clean aggregation
  let cleanDomain = data.targetDomain.toLowerCase();
  try {
    if (cleanDomain.startsWith('http')) {
      cleanDomain = new URL(cleanDomain).hostname;
    } else {
      cleanDomain = cleanDomain.split('/')[0].split('?')[0];
    }
  } catch {
    // Keep as is
  }

  sendEvent('tool_audit_run', {
    tool_type: data.toolType,
    target_domain: cleanDomain,
    audit_score: data.score,
    device_strategy: data.strategy || 'mobile',
    was_cached: Boolean(data.cached)
  });
}

export interface PdfDownloadEventData {
  leadId?: string;
  planName?: string;
  industry?: string;
  reportType?: string;
}

/**
 * Tracks PDF roadmap downloads and export reports
 */
export function trackPdfDownload(data: PdfDownloadEventData) {
  sendEvent('file_download', {
    file_name: `${data.reportType || 'seo_strategy_brief'}.pdf`,
    file_extension: 'pdf',
    report_type: data.reportType || 'onboarding_brief',
    plan_name: data.planName,
    industry: data.industry
  });
}

/**
 * Tracks contact inquiries from the manual contact form
 */
export function trackContactInquiry(data: { planId?: string; subject?: string }) {
  sendEvent('contact_inquiry_submitted', {
    plan_id: data.planId || 'general',
    inquiry_subject: data.subject || 'General Inquiry'
  });
}

/**
 * Tracks internal searches across blogs and directories
 */
export function trackSearch(data: { searchTerm: string; category?: string; resultCount?: number }) {
  sendEvent('search', {
    search_term: data.searchTerm,
    search_category: data.category || 'general',
    result_count: data.resultCount
  });
}
