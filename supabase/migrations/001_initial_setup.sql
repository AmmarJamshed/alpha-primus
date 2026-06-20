-- Alpha Primus Supabase Schema
-- Run via: supabase db push or apply in Supabase SQL editor

-- Enable full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('provider-images', 'provider-images', true),
  ('event-images', 'event-images', true),
  ('retreat-images', 'retreat-images', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
CREATE POLICY "Public read provider images" ON storage.objects
  FOR SELECT USING (bucket_id = 'provider-images');

CREATE POLICY "Public read event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Public read retreat images" ON storage.objects
  FOR SELECT USING (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated upload user files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads' AND auth.role() = 'authenticated'
  );

-- Full text search index (run after Prisma migration creates providers table)
-- CREATE INDEX providers_search_idx ON providers
--   USING gin(to_tsvector('english', name || ' ' || description || ' ' || array_to_string(specialties, ' ')));
