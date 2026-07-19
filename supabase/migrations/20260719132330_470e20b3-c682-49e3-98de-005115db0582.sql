-- Public read of entity-media bucket
CREATE POLICY "entity-media public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'entity-media');

-- TEMP admin writes on entity-media
CREATE POLICY "entity-media temp admin insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'entity-media');
CREATE POLICY "entity-media temp admin update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'entity-media') WITH CHECK (bucket_id = 'entity-media');
CREATE POLICY "entity-media temp admin delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'entity-media');