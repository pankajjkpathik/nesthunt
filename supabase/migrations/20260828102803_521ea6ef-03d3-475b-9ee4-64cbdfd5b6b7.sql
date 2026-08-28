DROP POLICY IF EXISTS "Public read awards" ON public.builder_awards;
CREATE POLICY "Public read awards" ON public.builder_awards FOR SELECT USING (public.is_entity_published('builder', builder_id));

DROP POLICY IF EXISTS "Public read certifications" ON public.builder_certifications;
CREATE POLICY "Public read certifications" ON public.builder_certifications FOR SELECT USING (public.is_entity_published('builder', builder_id));

DROP POLICY IF EXISTS "Public read faqs" ON public.builder_faqs;
CREATE POLICY "Public read faqs" ON public.builder_faqs FOR SELECT USING (public.is_entity_published('builder', builder_id) AND is_published IS DISTINCT FROM false);

DROP POLICY IF EXISTS "Public read leadership" ON public.builder_leadership;
CREATE POLICY "Public read leadership" ON public.builder_leadership FOR SELECT USING (public.is_entity_published('builder', builder_id));

DROP POLICY IF EXISTS "Public read rera" ON public.builder_rera_records;
CREATE POLICY "Public read rera" ON public.builder_rera_records FOR SELECT USING (public.is_entity_published('builder', builder_id));