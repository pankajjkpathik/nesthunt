
DROP POLICY IF EXISTS "Public read builder_places" ON public.builder_places;
CREATE POLICY "Public read published builder_places"
ON public.builder_places FOR SELECT
USING (
  public.is_entity_published('builder', builder_id)
  AND public.is_entity_published('place', place_id)
);

DROP POLICY IF EXISTS "Media usages are publicly readable" ON public.media_usages;
CREATE POLICY "Public read media_usages for published entities"
ON public.media_usages FOR SELECT
USING (public.is_entity_published(entity_type, entity_id));

DROP POLICY IF EXISTS "Media assets are publicly readable" ON public.media_assets;
CREATE POLICY "Public read media_assets used by published entities"
ON public.media_assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.media_usages mu
    WHERE mu.media_id = media_assets.id
      AND public.is_entity_published(mu.entity_type, mu.entity_id)
  )
);

CREATE POLICY "Admins can read all media_assets"
ON public.media_assets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read all media_usages"
ON public.media_usages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));
