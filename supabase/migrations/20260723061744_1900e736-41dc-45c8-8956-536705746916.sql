
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  folder text NOT NULL DEFAULT 'uncategorized',
  alt text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  credit text NOT NULL DEFAULT '',
  photographer text NOT NULL DEFAULT '',
  license text NOT NULL DEFAULT '',
  copyright text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX media_assets_folder_idx ON public.media_assets(folder);
CREATE INDEX media_assets_created_at_idx ON public.media_assets(created_at DESC);
CREATE INDEX media_assets_tags_idx ON public.media_assets USING gin(tags);

GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media assets are publicly readable" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Admins can insert media_assets" ON public.media_assets FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update media_assets" ON public.media_assets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete media_assets" ON public.media_assets FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER media_assets_set_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('place','builder','project','blog','review','document','seo')),
  entity_id uuid NOT NULL,
  field text NOT NULL DEFAULT 'gallery',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX media_usages_media_idx ON public.media_usages(media_id);
CREATE INDEX media_usages_entity_idx ON public.media_usages(entity_type, entity_id);
CREATE UNIQUE INDEX media_usages_unique_link ON public.media_usages(media_id, entity_type, entity_id, field, sort_order);

GRANT SELECT ON public.media_usages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_usages TO authenticated;
GRANT ALL ON public.media_usages TO service_role;

ALTER TABLE public.media_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media usages are publicly readable" ON public.media_usages FOR SELECT USING (true);
CREATE POLICY "Admins can insert media_usages" ON public.media_usages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update media_usages" ON public.media_usages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete media_usages" ON public.media_usages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.media_assets_with_usage AS
SELECT a.*, COALESCE(u.usage_count, 0) AS usage_count
FROM public.media_assets a
LEFT JOIN (
  SELECT media_id, COUNT(*)::int AS usage_count
  FROM public.media_usages
  GROUP BY media_id
) u ON u.media_id = a.id;

GRANT SELECT ON public.media_assets_with_usage TO anon, authenticated, service_role;
