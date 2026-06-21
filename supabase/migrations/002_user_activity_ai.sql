-- User activity tracking + AI wellness recommendations
-- Apply via Supabase SQL editor or: supabase db push

-- Profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  home_state TEXT CHECK (home_state IS NULL OR home_state IN ('CA', 'TX', 'FL', 'NY', 'IL')),
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Browsing and engagement events
CREATE TABLE IF NOT EXISTS public.user_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'page_view',
      'search',
      'provider_view',
      'retreat_view',
      'event_view',
      'category_click',
      'save',
      'guide_open'
    )
  ),
  entity_type TEXT,
  entity_id TEXT,
  entity_slug TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT activity_user_or_session CHECK (
    user_id IS NOT NULL OR (session_id IS NOT NULL AND length(session_id) >= 8)
  )
);

CREATE INDEX IF NOT EXISTS idx_activity_user_created
  ON public.user_activity_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_session_created
  ON public.user_activity_events (session_id, created_at DESC);

-- Optional mood / stress check-ins
CREATE TABLE IF NOT EXISTS public.user_wellness_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  mood_score SMALLINT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  stress_level SMALLINT NOT NULL CHECK (stress_level BETWEEN 1 AND 5),
  challenges TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT checkin_user_or_session CHECK (
    user_id IS NOT NULL OR (session_id IS NOT NULL AND length(session_id) >= 8)
  )
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_created
  ON public.user_wellness_checkins (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checkins_session_created
  ON public.user_wellness_checkins (session_id, created_at DESC);

-- Cached AI recommendation runs
CREATE TABLE IF NOT EXISTS public.user_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  support_level TEXT NOT NULL CHECK (
    support_level IN ('thriving', 'steady', 'needs_support', 'check_in_recommended')
  ),
  progress_summary TEXT NOT NULL,
  encouragement TEXT NOT NULL,
  wellness_tip TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rec_user_or_session CHECK (
    user_id IS NOT NULL OR (session_id IS NOT NULL AND length(session_id) >= 8)
  )
);

CREATE INDEX IF NOT EXISTS idx_ai_rec_user_created
  ON public.user_ai_recommendations (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_rec_session_created
  ON public.user_ai_recommendations (session_id, created_at DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wellness_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage own row
CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Activity: authenticated users own rows; anon can insert with session only
CREATE POLICY "activity_select_own" ON public.user_activity_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "activity_insert_auth" ON public.user_activity_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activity_insert_anon" ON public.user_activity_events
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Check-ins
CREATE POLICY "checkin_select_own" ON public.user_wellness_checkins
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "checkin_insert_auth" ON public.user_wellness_checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "checkin_insert_anon" ON public.user_wellness_checkins
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- AI recommendations
CREATE POLICY "ai_rec_select_own" ON public.user_ai_recommendations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "ai_rec_insert_auth" ON public.user_ai_recommendations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
