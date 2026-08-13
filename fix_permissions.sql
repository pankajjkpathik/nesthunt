-- Grant execute on has_role to public roles
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

-- Also ensure builders are readable by anyone if published
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'builders' AND policyname = 'Public can read published builders'
    ) THEN
        CREATE POLICY "Public can read published builders" ON public.builders
        FOR SELECT TO anon, authenticated
        USING (status = 'published');
    END IF;
END $$;
