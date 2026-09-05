declare namespace React {
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: 'true' | 'false' | boolean;
    toolparamtitle?: string;
    toolparamdescription?: string;
  }
}

export type Page = 'home' | 'about' | 'why-us' | 'pricing' | 'contact' | 'seo-tool' | 'admin' | 'blog' | 'site-map' | 'local-seo' | 'california' | 'los-angeles-seo' | 'state-seo' | 'city-seo' | 'privacy-policy' | 'terms-of-service' | 'case-studies' | 'demo' | 'locations-index' | 'locations-state' | 'locations-district' | 'compare-index' | 'compare-detail' | '404';

export interface CompetitorFeatureRow {
  feature: string;
  category: string;
  localSurge: string | boolean;
  competitor: string | boolean;
  note?: string;
}

export interface CompetitorSection {
  title: string;
  subtitle: string;
  content: string;
  keyTakeaway: string;
}

export interface CompetitorComparison {
  slug: string;
  competitorName: string;
  category: 'free-website' | 'local-seo' | 'premium-services';
  categoryLabel: string;
  targetKeyword: string;
  pageType: 'vs' | 'alternative' | 'roundup';
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  badge: string;
  verdict: string;
  lastUpdated: string;
  competitorProfile: {
    name: string;
    pricingSummary: string;
    bestFor: string;
    pros: string[];
    cons: string[];
  };
  localSurgeProfile: {
    planName: string;
    price: string;
    bestFor: string;
    pros: string[];
    cons: string[];
  };
  featureMatrix: CompetitorFeatureRow[];
  detailedSections: CompetitorSection[];
  faqs: {
    question: string;
    answer: string;
  }[];
  cta: {
    title: string;
    description: string;
    buttonText: string;
    buttonAction: 'onboarding' | 'seo-tool' | 'pricing';
  };
}

export interface DemoConfig {
  slug: string;
  businessName: string;
  niche: string;
  location: string;
  phone: string;
  email: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  services: {
    title: string;
    description: string;
  }[];
  reviews: {
    author: string;
    rating: number;
    text: string;
  }[];
  claimed?: boolean;
}


export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
  popular?: boolean;
}

export interface LeadInput {
  planId: string;
  planName: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  hasWebsite: boolean;
  industry: string;
  location: string;
  keywords: string;
  hasGBP: boolean;
  gbpLink?: string;
}

export interface SEOAuditResult {
  overallScore: number;
  domainName: string;
  niche: string;
  location: string;
  timestamp: string;
  analysis: {
    title: string;
    score: number;
    description: string;
    recommendations: string[];
  }[];
  executiveSummary: string;
  actionPlan: string[];
}

export interface Lead {
  id: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'audit_prepared' | 'onboarded' | 'archived' | 'pending' | 'completed';
  notes?: string;
  input: LeadInput;
  aiAudit?: SEOAuditResult;
}

export interface OutreachProspect {
  id: string;
  businessName: string;
  website: string;
  email: string;
  phone?: string;
  niche: string;
  location: string;
  hasSchema: boolean;
  napScore: number;
  mapRanking: string;
  source: string;
  emailValid: boolean;
}

export interface OutreachPitchItem {
  id: string;
  prospect: OutreachProspect;
  createdAt: string;
  status: 'queued' | 'approved' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'rejected';
  teaserPoints: string[];
  emailSubject: string;
  emailBody: string;
  auditScore: number;
  recommendedPlanId: 'single-page' | 'starter' | 'premium';
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  notes?: string;
}

export interface MicroToolConfig {
  toolType: 'h1-scanner' | 'breadcrumb-schema' | 'meta-length' | 'opengraph' | 'alt-tag' | 'canonical' | 'cls-simulator' | 'llms-generator' | 'nap-formatter' | 'lsa-calculator' | 'pagespeed-scanner';
  toolTitle: string;
  toolDescription: string;
  placeholderUrl: string;
  checkCriteria: string[];
}

export interface BlogDraftItem {
  id: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'rejected';
  slug: string;
  title: string;
  category: string;
  description: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  sections: {
    type: 'paragraph' | 'heading' | 'bullet-list' | 'numbered-list' | 'quote' | 'alert-box' | 'micro-tool';
    content: string;
    items?: string[];
    toolConfig?: MicroToolConfig;
  }[];
}


