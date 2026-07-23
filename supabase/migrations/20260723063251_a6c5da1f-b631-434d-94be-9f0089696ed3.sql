
-- Generic relationship edge table
CREATE TABLE IF NOT EXISTS public.entity_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_type TEXT NOT NULL,
  from_id UUID NOT NULL,
  to_type TEXT NOT NULL,
  to_id UUID NOT NULL,
  kind TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT entity_relationships_from_type_chk CHECK (from_type IN ('place','builder','project','media','document','category','amenity','blog')),
  CONSTRAINT entity_relationships_to_type_chk CHECK (to_type IN ('place','builder','project','media','document','category','amenity','blog')),
  CONSTRAINT entity_relationships_no_self CHECK (NOT (from_type = to_type AND from_id = to_id)),
  CONSTRAINT entity_relationships_unique UNIQUE (from_type, from_id, to_type, to_id, kind)
);

GRANT SELECT ON public.entity_relationships TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.entity_relationships TO authenticated;
GRANT ALL ON public.entity_relationships TO service_role;

ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relationships readable to all"
  ON public.entity_relationships FOR SELECT
  USING (true);

CREATE POLICY "admins manage relationships insert"
  ON public.entity_relationships FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage relationships update"
  ON public.entity_relationships FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins manage relationships delete"
  ON public.entity_relationships FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS entity_relationships_from_idx
  ON public.entity_relationships (from_type, from_id, kind);
CREATE INDEX IF NOT EXISTS entity_relationships_to_idx
  ON public.entity_relationships (to_type, to_id, kind);

CREATE TRIGGER entity_relationships_updated_at
  BEFORE UPDATE ON public.entity_relationships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Validation function callable from services
CREATE OR REPLACE FUNCTION public.check_relationship_valid(
  _from_type TEXT,
  _from_id UUID,
  _to_type TEXT,
  _to_id UUID,
  _kind TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF _from_type = _to_type AND _from_id = _to_id THEN
    RAISE EXCEPTION 'Self-references are not allowed';
  END IF;

  -- Cardinality: project has exactly one builder & one place
  IF _from_type = 'project' AND _to_type = 'builder' AND _kind = 'builder' THEN
    IF EXISTS (
      SELECT 1 FROM public.entity_relationships
      WHERE from_type='project' AND from_id=_from_id
        AND to_type='builder' AND kind='builder' AND to_id <> _to_id
    ) THEN
      RAISE EXCEPTION 'Project can only have one builder';
    END IF;
  END IF;

  IF _from_type = 'project' AND _to_type = 'place' AND _kind = 'place' THEN
    IF EXISTS (
      SELECT 1 FROM public.entity_relationships
      WHERE from_type='project' AND from_id=_from_id
        AND to_type='place' AND kind='place' AND to_id <> _to_id
    ) THEN
      RAISE EXCEPTION 'Project can only have one place';
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- Orphan detection helpers used by the health dashboard
CREATE OR REPLACE FUNCTION public.rel_orphaned_projects()
RETURNS TABLE(id UUID, name TEXT, slug TEXT, missing TEXT)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT p.id, p.name, p.slug,
    CASE
      WHEN p.builder_id IS NULL AND p.place_id IS NULL THEN 'builder+place'
      WHEN p.builder_id IS NULL THEN 'builder'
      ELSE 'place'
    END AS missing
  FROM public.projects p
  WHERE p.builder_id IS NULL OR p.place_id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.rel_places_without_projects()
RETURNS TABLE(id UUID, name TEXT, slug TEXT)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT pl.id, pl.name, pl.slug
  FROM public.places pl
  LEFT JOIN public.projects pr ON pr.place_id = pl.id
  WHERE pr.id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.rel_builders_without_projects()
RETURNS TABLE(id UUID, name TEXT, slug TEXT)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT b.id, b.name, b.slug
  FROM public.builders b
  LEFT JOIN public.projects pr ON pr.builder_id = b.id
  WHERE pr.id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.rel_unlinked_media()
RETURNS TABLE(id UUID, file_name TEXT, folder TEXT)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT m.id, m.file_name, m.folder
  FROM public.media_assets m
  LEFT JOIN public.media_usages mu ON mu.media_id = m.id
  WHERE mu.id IS NULL AND COALESCE(m.archived, false) = false;
$$;

CREATE OR REPLACE FUNCTION public.rel_places_without_builders()
RETURNS TABLE(id UUID, name TEXT, slug TEXT)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT pl.id, pl.name, pl.slug
  FROM public.places pl
  LEFT JOIN public.builder_places bp ON bp.place_id = pl.id
  WHERE bp.builder_id IS NULL;
$$;
