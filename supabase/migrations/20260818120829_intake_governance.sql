-- Project Intake Factory & Verification Governance Migration

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.intake_status AS ENUM ('DRAFT', 'DATA_REVIEW', 'VERIFIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_level AS ENUM ('STANDARD', 'ENHANCED', 'DEEP_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.exception_type AS ENUM (
        'RERA_CONFLICT', 'IDENTITY_CONFLICT', 'BUILDER_CONFLICT', 'PLACE_CONFLICT',
        'POSSESSION_CONFLICT', 'PROGRESS_OUTDATED', 'MISSING_RERA', 'MISSING_EVIDENCE',
        'REGULATORY_REFERENCE', 'PRICE_UNAVAILABLE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.exception_status AS ENUM ('OPEN', 'RESOLVED', 'WAIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create project_governance table
CREATE TABLE IF NOT EXISTS public.project_governance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
    intake_status public.intake_status NOT NULL DEFAULT 'DRAFT',
    verification_level public.verification_level NOT NULL DEFAULT 'STANDARD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_governance TO authenticated;
GRANT ALL ON public.project_governance TO service_role;

ALTER TABLE public.project_governance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage project_governance"
ON public.project_governance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create project_exceptions table
CREATE TABLE IF NOT EXISTS public.project_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type public.exception_type NOT NULL,
    status public.exception_status NOT NULL DEFAULT 'OPEN',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_exceptions TO authenticated;
GRANT ALL ON public.project_exceptions TO service_role;

ALTER TABLE public.project_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage project_exceptions"
ON public.project_exceptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Audit Log Triggers (Assuming standard audit log pattern)
-- (Existing audit_logs table is already present as per investigation)

-- 5. Seed Initial Data for Gardenia Floors and Celestia Royal 2C
DO $$
DECLARE
    gardenia_id UUID;
    celestia_id UUID;
BEGIN
    SELECT id INTO gardenia_id FROM public.projects WHERE slug = 'gardenia-floors';
    SELECT id INTO celestia_id FROM public.projects WHERE slug = 'celestia-royal-2c';

    IF gardenia_id IS NOT NULL THEN
        INSERT INTO public.project_governance (project_id, intake_status, verification_level)
        VALUES (gardenia_id, 'VERIFIED', 'STANDARD')
        ON CONFLICT (project_id) DO UPDATE SET intake_status = 'VERIFIED', verification_level = 'STANDARD';
    END IF;

    IF celestia_id IS NOT NULL THEN
        INSERT INTO public.project_governance (project_id, intake_status, verification_level)
        VALUES (celestia_id, 'DATA_REVIEW', 'ENHANCED')
        ON CONFLICT (project_id) DO UPDATE SET intake_status = 'DATA_REVIEW', verification_level = 'ENHANCED';

        -- Add REGULATORY_REFERENCE exception for Celestia
        INSERT INTO public.project_exceptions (project_id, type, status, note)
        VALUES (celestia_id, 'REGULATORY_REFERENCE', 'OPEN', 'Verified RERA cause-list references 2627 and 2684 identified. Substantive order outcome pending verification.')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
