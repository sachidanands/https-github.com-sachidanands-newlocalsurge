export type Page = 'home' | 'about' | 'why-us' | 'pricing' | 'contact' | 'seo-tool' | 'admin' | 'blog' | 'site-map' | 'local-seo' | 'california' | 'los-angeles-seo' | 'state-seo' | 'city-seo' | 'privacy-policy' | 'terms-of-service' | 'case-studies';

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
