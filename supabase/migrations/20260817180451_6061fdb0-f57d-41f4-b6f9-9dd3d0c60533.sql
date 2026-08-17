-- BUILD-030 — DECISION LAYER INTEGRITY & PROVENANCE ENGINE

-- 1. Add provenance and semantic metadata fields to Decision Layer tables

-- Update decision_scores table
ALTER TABLE public.decision_scores 
ADD COLUMN IF NOT EXISTS source_type text,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Add check constraints for decision_scores
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decision_scores_source_type_check') THEN
        ALTER TABLE public.decision_scores 
        ADD CONSTRAINT decision_scores_source_type_check 
        CHECK (source_type = ANY (ARRAY[
            'LEGACY_MIGRATION', 
            'CMS_ASSESSMENT', 
            'DERIVED_METRIC', 
            'VERIFIED_EVIDENCE', 
            'SYSTEM_CALCULATION', 
            'USER_INPUT'
        ]));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'decision_scores_status_check') THEN
        ALTER TABLE public.decision_scores 
        ADD CONSTRAINT decision_scores_status_check 
        CHECK (status = ANY (ARRAY['draft', 'review', 'published', 'archived']));
    END IF;
END $$;

-- Update decision_dimensions table
ALTER TABLE public.decision_dimensions
ADD COLUMN IF NOT EXISTS entity_applicability text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compatibility_group text,
ADD COLUMN IF NOT EXISTS semantic_definition text;

-- 2. Update existing data from BUILD-029 with provenance markers

-- Mark migrated scores as LEGACY_MIGRATION and published
UPDATE public.decision_scores
SET 
    source_type = 'LEGACY_MIGRATION',
    status = 'published'
WHERE calculation_version = 'legacy-migration-v1';

-- Mark project placeholders as SYSTEM_CALCULATION and draft
UPDATE public.decision_scores
SET 
    source_type = 'SYSTEM_CALCULATION',
    status = 'draft'
WHERE calculation_version = 'v1_migration' AND score = 0;

-- 3. Initialize dimension semantics and applicability
UPDATE public.decision_dimensions
SET 
    entity_applicability = ARRAY['place'],
    compatibility_group = 'place_standard_v1',
    semantic_definition = 'Legacy place intelligence assessment metric.'
WHERE code IN ('connectivity', 'education', 'livability', 'growth', 'safety', 'investment');

UPDATE public.decision_dimensions
SET 
    entity_applicability = ARRAY['builder'],
    compatibility_group = 'builder_standard_v1',
    semantic_definition = 'Normalized builder trust score based on experience, delivery, and legal metrics.'
WHERE code = 'builder_trust';

-- 4. Update Public RLS to respect decision_scores status
-- (Assuming public already only sees published entities, but we add an extra layer of safety)

DROP POLICY IF EXISTS ds_public_read_published ON public.decision_scores;
CREATE POLICY ds_public_read_published ON public.decision_scores FOR SELECT
TO anon, authenticated
USING (
    status = 'published' AND 
    di_entity_published(decision_entity_id)
);

-- 5. Documentation Comment
COMMENT ON COLUMN public.decision_scores.source_type IS 'Traceable source of the score assessment (e.g., LEGACY_MIGRATION, CMS_ASSESSMENT).';
COMMENT ON COLUMN public.decision_dimensions.compatibility_group IS 'Identifiers with the same group are considered semantically compatible for cross-entity comparison.';

-- 6. Grant access to new columns (implicit in existing grants, but ensuring consistency)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_scores TO authenticated;
GRANT SELECT ON public.decision_scores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_dimensions TO authenticated;
GRANT SELECT ON public.decision_dimensions TO anon;
