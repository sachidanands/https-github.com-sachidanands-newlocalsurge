-- ============================================================================
-- Local Surge SEO — Supabase Blog Table Schema & Row Level Security (RLS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  image TEXT NOT NULL,
  author JSONB NOT NULL DEFAULT '{"name": "Alex Rivera", "role": "Lead SEO Strategist", "avatar": "AR"}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published',
  cluster_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optimization indexes for high-speed indexing, search, and pagination
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status_date ON public.blogs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs (category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and public users to read published blog articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Public can view published blogs'
  ) THEN
    CREATE POLICY "Public can view published blogs"
    ON public.blogs
    FOR SELECT
    USING (status = 'published');
  END IF;
END $$;

-- Allow service role full CRUD operations (bypasses or validates via service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'blogs' AND policyname = 'Service role full access on blogs'
  ) THEN
    CREATE POLICY "Service role full access on blogs"
    ON public.blogs
    FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;
