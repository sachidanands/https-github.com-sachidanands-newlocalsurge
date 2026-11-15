-- =========================================================================
-- AI FrontDesk Standalone SaaS ($5/mo + 30-day Free Trial)
-- Analytics events table for Customer Dashboard & Lifetime Usage Tracking
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.frontdesk_events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  session_id TEXT,
  type TEXT NOT NULL,
  value NUMERIC,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_frontdesk_events_site_created
  ON public.frontdesk_events(site_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_frontdesk_events_site_type_created
  ON public.frontdesk_events(site_id, type, created_at DESC);

ALTER TABLE public.frontdesk_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'frontdesk_events' AND policyname = 'Service Role Full Access Events'
  ) THEN
    CREATE POLICY "Service Role Full Access Events" ON public.frontdesk_events
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
