export type LeadUrgency = 'emergency' | 'urgent' | 'standard' | 'inquiry';
export type LeadStatus = 'new' | 'contacted' | 'dispatched' | 'closed';
export type SiteStatus = 'active' | 'grace_period' | 'soft_locked' | 'paused' | 'suspended';
export type PlanTier = 'free' | 'trial' | 'starter' | 'pro' | 'enterprise';

export type SubscriptionStatus =
  | 'trialing'
  | 'grace'
  | 'active'
  | 'past_due'
  | 'canceling'
  | 'paused'
  | 'internal'
  | 'comped';

export type IconPresetId =
  | 'chat'
  | 'headset'
  | 'sparkles'
  | 'message'
  | 'wrench'
  | 'heart'
  | 'shield'
  | 'bolt';

export type LeadDeliveryMode = 'email' | 'endpoint' | 'form';

export interface FrontdeskFeatureFlags {
  enablePhotoUpload: boolean;
  enableEmailDispatch: boolean;
  enableSmsDispatch: boolean;
  enablePhoneCallback: boolean;
  enableEmergencyBanner: boolean;
  enableDirectBooking: boolean;
  enableCustomBranding: boolean;
  planTier?: PlanTier | string;
}

export interface DetectedFormField {
  key: 'name' | 'email' | 'phone' | 'message' | string;
  selector: string;
  name?: string;
  type?: string;
  label?: string;
}

export interface DetectedForm {
  page_url: string;
  form_selector: string;
  action?: string;
  method?: string;
  has_captcha?: boolean;
  submit_selector?: string;
  fields: DetectedFormField[];
}

export interface FormDeliveryPublicConfig {
  page_url: string;
  form_selector: string;
  submit_selector?: string;
  auto_submit?: boolean;
  field_map: Record<string, string>;
}

export interface LeadDeliveryConfig {
  mode: LeadDeliveryMode;
  notify_email?: string;
  endpoint?: {
    url: string;
    method?: 'POST';
    format?: 'json' | 'form';
    headers?: Record<string, string>;
    field_map?: Record<string, string>;
  };
  form?: {
    page_url: string;
    form_selector: string;
    submit_selector?: string;
    auto_submit?: boolean;
    has_captcha?: boolean;
    field_map: Record<string, string>;
  };
  detected_forms?: DetectedForm[];
}

export interface SiteSubscription {
  status: SubscriptionStatus;
  provider?: 'paypal' | null;
  paypal_subscription_id?: string | null;
  paypal_plan_id?: string | null;
  current_period_end?: string | null;
  past_due_since?: string | null;
  canceled_at?: string | null;
  pause_reason?: string | null;
  activated_at?: string | null;
}

export interface WidgetConfig {
  themeColor: string;
  greeting: string;
  speedToLeadCity: string;
  quickChips: string[];
  position?: 'right' | 'left';
  assistantName?: string;
  iconPreset?: IconPresetId | string;
  iconUrl?: string;
  showPoweredBy?: boolean;
  formDelivery?: FormDeliveryPublicConfig;
}

export interface ScrapedKnowledge {
  businessName: string;
  industry: string;
  tagline?: string;
  primaryServices: string[];
  serviceAreas: string[];
  emergencyPolicy: string;
  estimatePolicy: string;
  pricingCues: string[];
  faqs: Array<{ question: string; answer: string }>;
  keyFacts: string[];
  rawPageCount?: number;
  extractedAt?: string;
  customNotes?: string;
  [key: string]: unknown;
}

export interface FrontdeskSite {
  id: string;
  created_at: string;
  updated_at?: string;
  business_name: string;
  industry: string;
  website_url?: string;
  phone?: string;
  emergency_phone?: string;
  service_radius?: {
    city?: string;
    radiusMiles?: number;
    zipCodes?: string[];
  };
  estimate_policy?: string;
  working_hours?: {
    weekday?: string;
    weekend?: string;
    emergency247?: boolean;
  };
  widget_config: WidgetConfig;
  feature_flags?: FrontdeskFeatureFlags;
  scraped_knowledge?: Partial<ScrapedKnowledge>;
  custom_instructions?: string;
  status: SiteStatus | string;
  contact_name?: string;
  contact_email?: string;
  is_trial?: boolean;
  trial_ends_at?: string;
  grace_ends_at?: string;
  trial_expiry_email_sent_at?: string | null;
  grace_ended_email_sent_at?: string | null;
  path_prefix?: string;
  allowed_paths?: string[];
  enabled?: boolean;
  is_internal?: boolean;
  is_comped?: boolean;
  installed_at?: string | null;
  last_seen_at?: string | null;
  last_seen_origin?: string | null;
  last_crawled_at?: string | null;
  emails_sent?: Record<string, string>;
  subscription?: SiteSubscription;
  lead_delivery?: LeadDeliveryConfig;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp?: string;
}

export interface QualificationSummary {
  urgencyScore?: number;
  isInsideServiceArea?: boolean;
  actionRequired?: string;
  estimatedJobValue?: number;
  [key: string]: unknown;
}

export interface FrontdeskLead {
  id: string;
  site_id: string;
  created_at: string;
  status: LeadStatus | string;
  urgency: LeadUrgency | string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_address?: string | null;
  issue_description?: string | null;
  photo_urls?: string[];
  transcript?: ChatMessage[];
  qualification_summary?: QualificationSummary;
  dispatched_at?: string;
  dispatch_channel?: string;
  delivery_status?: Record<string, unknown>;
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
  pagesScraped: string[];
  knowledge: ScrapedKnowledge;
  detectedForms?: DetectedForm[];
  error?: string;
}

export type FrontdeskEventType =
  | 'load'
  | 'open'
  | 'message'
  | 'lead'
  | 'session_end'
  | 'form_submit';

export interface FrontdeskEvent {
  id?: number;
  site_id: string;
  session_id?: string | null;
  type: FrontdeskEventType;
  value?: number | null;
  meta?: Record<string, unknown> | null;
  created_at: string;
}

export interface PortalSite {
  id: string;
  business_name: string;
  website_url?: string;
  phone?: string;
  contact_name?: string;
  contact_email?: string;
  enabled: boolean;
  widgetVisible: boolean;
  installed_at?: string | null;
  last_seen_at?: string | null;
  last_seen_origin?: string | null;
  last_crawled_at?: string | null;
  trial_ends_at?: string | null;
  grace_ends_at?: string | null;
  is_comped?: boolean;
  is_internal?: boolean;
  subscription: SiteSubscription;
  widget_config: WidgetConfig;
  lead_delivery: LeadDeliveryConfig;
  scraped_knowledge?: Partial<ScrapedKnowledge>;
  custom_instructions?: string;
  billingConfigured: boolean;
  paypalClientId?: string | null;
  paypalPlanId?: string | null;
  monthlyPriceUsd: number;
  stats: {
    leads30d: number;
    chats30d: number;
  };
}

export interface FrontdeskAnalyticsSummary {
  days: number;
  totals: {
    widgetLoads: number;
    widgetOpens: number;
    conversations: number;
    messages: number;
    leads: number;
    formSubmits: number;
    avgSessionSeconds: number;
    conversionRate: number;
  };
  previousTotals: {
    widgetLoads: number;
    widgetOpens: number;
    conversations: number;
    leads: number;
    avgSessionSeconds: number;
    conversionRate: number;
  };
  deltasPct: {
    conversations: number | null;
    leads: number | null;
    avgSessionSeconds: number | null;
    conversionRate: number | null;
  };
  series: Array<{
    date: string;
    loads: number;
    opens: number;
    conversations: number;
    leads: number;
    avgSessionSeconds: number;
  }>;
  hourlyActivity: Array<{
    hour: number;
    conversations: number;
    leads: number;
  }>;
  topQuestions: Array<{
    question: string;
    count: number;
  }>;
  highlights: string[];
}
