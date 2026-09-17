-- =========================================================================
-- LOCALSURGE AI FRONTDESK (SURGEBOT) — SUPABASE POSTGRES SCHEMA
-- Version: 1.0.0
-- Description: Production-ready DDL for FrontDesk sites, knowledge profiles,
--              and qualified lead dispatch pipelines.
-- =========================================================================

-- 1. Create frontdesk_sites table
CREATE TABLE IF NOT EXISTS public.frontdesk_sites (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'general_contractor',
  website_url TEXT,
  phone TEXT,
  emergency_phone TEXT,
  service_radius JSONB DEFAULT '{"city": "Local Area", "radiusMiles": 25, "zipCodes": []}'::jsonb,
  estimate_policy TEXT DEFAULT 'Free estimates during normal business hours. Diagnostic fee applies for after-hours emergency dispatch.',
  working_hours JSONB DEFAULT '{"weekday": "7:00 AM - 7:00 PM", "weekend": "8:00 AM - 5:00 PM", "emergency247": true}'::jsonb,
  scraped_knowledge JSONB DEFAULT '{}'::jsonb,
  widget_config JSONB DEFAULT '{
    "themeColor": "#10b981",
    "greeting": "👋 Hi there! Need urgent service or a fast quote? Let me know how we can help!",
    "speedToLeadCity": "Local Area",
    "quickChips": [
      "🚨 24/7 Emergency Service",
      "📍 Check My Zip Code",
      "💰 Get a Free Estimate",
      "📞 Request 5-Min Callback"
    ]
  }'::jsonb,
  feature_flags JSONB DEFAULT '{
    "enablePhotoUpload": true,
    "enableEmailDispatch": true,
    "enableSmsDispatch": false,
    "enablePhoneCallback": true,
    "enableEmergencyBanner": true,
    "enableDirectBooking": false,
    "enableCustomBranding": false,
    "planTier": "starter"
  }'::jsonb,
  custom_instructions TEXT,
  status TEXT DEFAULT 'active' NOT NULL
);

-- 2. Create frontdesk_leads table
CREATE TABLE IF NOT EXISTS public.frontdesk_leads (
  id TEXT PRIMARY KEY,
  site_id TEXT REFERENCES public.frontdesk_sites(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'contacted', 'dispatched', 'closed'
  urgency TEXT DEFAULT 'standard' NOT NULL, -- 'emergency', 'urgent', 'standard', 'inquiry'
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_address TEXT,
  issue_description TEXT,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  transcript JSONB DEFAULT '[]'::jsonb,
  qualification_summary JSONB DEFAULT '{}'::jsonb,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  dispatch_channel TEXT DEFAULT 'email' -- 'sms', 'email', 'webhook', 'multi'
);

-- 3. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_frontdesk_sites_status ON public.frontdesk_sites(status);
CREATE INDEX IF NOT EXISTS idx_frontdesk_sites_created ON public.frontdesk_sites(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_frontdesk_leads_site_id ON public.frontdesk_leads(site_id);
CREATE INDEX IF NOT EXISTS idx_frontdesk_leads_urgency ON public.frontdesk_leads(urgency);
CREATE INDEX IF NOT EXISTS idx_frontdesk_leads_status ON public.frontdesk_leads(status);
CREATE INDEX IF NOT EXISTS idx_frontdesk_leads_created ON public.frontdesk_leads(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.frontdesk_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frontdesk_leads ENABLE ROW LEVEL SECURITY;

-- 5. Security Policies: Service role has full unrestricted access (used by Node API backend)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frontdesk_sites' AND policyname = 'Service Role Full Access Sites'
  ) THEN
    CREATE POLICY "Service Role Full Access Sites" ON public.frontdesk_sites
      FOR ALL USING (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frontdesk_leads' AND policyname = 'Service Role Full Access Leads'
  ) THEN
    CREATE POLICY "Service Role Full Access Leads" ON public.frontdesk_leads
      FOR ALL USING (auth.role() = 'service_role');
  END IF;

  -- Allow public read on active widget site configurations (by explicit site id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frontdesk_sites' AND policyname = 'Public Widget Site Read'
  ) THEN
    CREATE POLICY "Public Widget Site Read" ON public.frontdesk_sites
      FOR SELECT USING (status = 'active');
  END IF;

  -- Allow public insert of new qualified leads from the FrontDesk widget
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frontdesk_leads' AND policyname = 'Public Lead Submission'
  ) THEN
    CREATE POLICY "Public Lead Submission" ON public.frontdesk_leads
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
