
CREATE OR REPLACE FUNCTION public.is_entity_published(_entity_type text, _entity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _entity_type
    WHEN 'place'   THEN EXISTS (SELECT 1 FROM public.places   WHERE id = _entity_id AND status = 'published')
    WHEN 'builder' THEN EXISTS (SELECT 1 FROM public.builders WHERE id = _entity_id AND status = 'published')
    WHEN 'project' THEN EXISTS (SELECT 1 FROM public.projects WHERE id = _entity_id AND status = 'published')
    ELSE TRUE
  END;
$$;

REVOKE ALL ON FUNCTION public.is_entity_published(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_entity_published(text, uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Builders are publicly readable" ON public.builders;
CREATE POLICY "Builders published are publicly readable"
  ON public.builders FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.builders FROM anon;
GRANT SELECT (
  id, slug, name, headquarters, years_active, summary, metrics, decision,
  strengths, watch_outs, timeline, featured, created_at, updated_at, status,
  verified, builder_type, tagline, description, country, state, city,
  year_established, head_office, website, organization_type, employee_count,
  trust_score, trust_breakdown, leadership, rera, awards, certifications,
  hero, seo
) ON public.builders TO anon;

DROP POLICY IF EXISTS "Entity images are publicly readable" ON public.entity_images;
CREATE POLICY "Entity images for published entities"
  ON public.entity_images FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.is_entity_published(entity_type, entity_id));

DROP POLICY IF EXISTS "Entity documents are publicly readable" ON public.entity_documents;
CREATE POLICY "Entity documents for published entities"
  ON public.entity_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.is_entity_published(entity_type, entity_id));

DROP POLICY IF EXISTS "Entity scores are publicly readable" ON public.entity_scores;
CREATE POLICY "Entity scores for published entities"
  ON public.entity_scores FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.is_entity_published(entity_type, entity_id));

DROP POLICY IF EXISTS "relationships readable to all" ON public.entity_relationships;
CREATE POLICY "Relationships between published entities"
  ON public.entity_relationships FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.is_entity_published(from_type, from_id) AND public.is_entity_published(to_type, to_id))
  );

DROP POLICY IF EXISTS "infra_links public read" ON public.infrastructure_links;
CREATE POLICY "Infra links for published entities"
  ON public.infrastructure_links FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.is_entity_published(entity_type, entity_id));

DROP POLICY IF EXISTS "entity-media public read" ON storage.objects;
CREATE POLICY "entity-media public read for published"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'entity-media'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1
        FROM public.media_assets ma
        JOIN public.media_usages mu ON mu.media_id = ma.id
        WHERE ma.storage_path = storage.objects.name
          AND public.is_entity_published(mu.entity_type, mu.entity_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.entity_images ei
        WHERE ei.storage_path = storage.objects.name
          AND public.is_entity_published(ei.entity_type, ei.entity_id)
      )
    )
  );

REVOKE EXECUTE ON FUNCTION public.bootstrap_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO service_role;
