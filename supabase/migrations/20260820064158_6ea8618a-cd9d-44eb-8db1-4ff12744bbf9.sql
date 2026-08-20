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
