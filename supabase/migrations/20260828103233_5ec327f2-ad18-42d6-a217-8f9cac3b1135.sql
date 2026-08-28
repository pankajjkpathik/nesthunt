CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Public can read project governance classification" ON public.project_governance;

CREATE POLICY "Public can read production governance rows"
ON public.project_governance
FOR SELECT
TO anon, authenticated
USING (record_classification = 'PRODUCTION');

GRANT SELECT ON public.project_governance TO anon, authenticated;
GRANT ALL ON public.project_governance TO service_role;