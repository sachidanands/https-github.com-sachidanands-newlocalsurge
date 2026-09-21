export type LeadUrgency = 'emergency' | 'urgent' | 'standard' | 'inquiry';
export type LeadStatus = 'new' | 'contacted' | 'dispatched' | 'closed';
export type SiteStatus = 'active' | 'paused' | 'archived' | 'expired' | 'grace_period' | 'soft_locked' | 'active_paid';
export type PlanTier = 'standard' | 'custom' | 'trial' | 'micro' | 'starter' | 'pro' | 'enterprise' | 'standard_paid';

export interface FrontdeskFeatureFlags {
  enablePhotoUpload: boolean;        // Allow homeowner damage picture uploads + AI vision analysis
  enableEmailDispatch: boolean;      // Instant dispatch email alerts via Resend
  enableSmsDispatch: boolean;        // SMS alerts via webhook / Twilio
  enablePhoneCallback: boolean;      // 5-min urgent phone callback request option
  enableEmergencyBanner: boolean;    // Live "🟢 Technicians On-Duty in [City]" speed-to-lead badge
  enableDirectBooking: boolean;      // Embedded booking calendar link
  enableCustomBranding: boolean;     // Remove "⚡ Powered by LocalSurge" (white-label)
  planTier?: PlanTier;               // e.g. 'standard' ($10), 'custom', 'trial', 'standard_paid'
}

export interface ServiceRadius {
  city: string;
  state?: string;
  radiusMiles: number;
  zipCodes?: string[];
  neighborhoods?: string[];
}

export interface WorkingHours {
  weekday: string;
  weekend: string;
  emergency247: boolean;
  holidayNote?: string;
}

export interface WidgetConfig {
  themeColor: string;
  greeting: string;
  speedToLeadCity: string;
  quickChips: string[];
  phonePrompt?: string;
  position?: 'bottom-right' | 'bottom-left';
  showPoweredBy?: boolean;
  path_prefix?: string;
  allowed_paths?: string[];
}

export interface ScrapedKnowledge {
  businessName?: string;
  industry?: string;
  tagline?: string;
  primaryServices: string[];
  serviceAreas: string[];
  emergencyPolicy: string;
  estimatePolicy: string;
  pricingCues: string[];
  faqs: Array<{ question: string; answer: string }>;
  keyFacts: string[];
  extractedAt?: string;
  rawPageCount?: number;
}

export interface FrontdeskSite {
  id: string;
  created_at: string;
  updated_at: string;
  business_name: string;
  industry: string;
  website_url?: string;
  target_domain?: string;
  path_prefix?: string;
  allowed_paths?: string[];
  phone?: string;
  emergency_phone?: string;
  contact_name?: string;
  contact_email?: string;
  is_trial?: boolean;
  trial_ends_at?: string;
  grace_ends_at?: string;
  trial_expiry_email_sent_at?: string;
  grace_ended_email_sent_at?: string;
  is_expired?: boolean;
  plan_tier?: PlanTier;
  checkout_url?: string;
  service_radius: ServiceRadius;
  estimate_policy: string;
  working_hours: WorkingHours;
  scraped_knowledge: ScrapedKnowledge;
  widget_config: WidgetConfig;
  feature_flags?: FrontdeskFeatureFlags;
  custom_instructions?: string;
  status: SiteStatus;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface QualificationSummary {
  urgencyScore?: number;
  detectedService?: string;
  estimatedScope?: string;
  actionRequired?: string;
  isInsideServiceArea?: boolean;
  visualDamageAnalysis?: string;
}

export interface FrontdeskLead {
  id: string;
  site_id: string;
  created_at: string;
  status: LeadStatus;
  urgency: LeadUrgency;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_address?: string;
  issue_description?: string;
  photo_urls?: string[];
  transcript?: ChatMessage[];
  qualification_summary?: QualificationSummary;
  dispatched_at?: string;
  dispatch_channel?: 'sms' | 'email' | 'webhook' | 'multi' | 'none';
}

export interface CrawlRequest {
  url: string;
  businessName?: string;
  industry?: string;
  deepCrawl?: boolean;
}

export interface CrawlResult {
  success: boolean;
  url: string;
  knowledge: ScrapedKnowledge;
  pagesScraped: string[];
  error?: string;
}
