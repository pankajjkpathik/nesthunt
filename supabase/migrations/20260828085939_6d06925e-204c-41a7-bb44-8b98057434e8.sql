GRANT SELECT ON public.project_governance TO anon;

DROP POLICY IF EXISTS "Public can read project governance classification" ON public.project_governance;
CREATE POLICY "Public can read project governance classification"
ON public.project_governance
FOR SELECT
TO anon, authenticated
USING (true);