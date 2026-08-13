-- Grant execute permission on the has_role function so RLS policies can evaluate it for anonymous visitors
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- Ensure read access to builders table for all users
GRANT SELECT ON public.builders TO anon, authenticated;

-- Create a policy to allow anyone to read published builders if it doesn't exist
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
