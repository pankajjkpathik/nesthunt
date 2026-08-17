-- BUILD-029 Score Normalization & Migration

-- 1. Ensure new dimensions exist
INSERT INTO public.decision_dimensions(code, name, is_active) 
VALUES 
  ('investment', 'Investment Potential', true), 
  ('safety', 'Safety & Security', true) 
ON CONFLICT (code) DO NOTHING;

-- 2. Ensure Decision Entities exist for all Places and Builders
INSERT INTO public.decision_entities (entity_type, entity_id, status)
SELECT 'place', id, status FROM public.places
ON CONFLICT (entity_type, entity_id) DO NOTHING;

INSERT INTO public.decision_entities (entity_type, entity_id, status)
SELECT 'builder', id, status FROM public.builders
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- 3. Place Migration
-- Map Category Ratings
WITH dimension_mapping(label, code) AS (
    VALUES 
        ('Connectivity', 'connectivity'),
        ('Education', 'education'),
        ('Livability', 'livability'),
        ('Investment', 'investment'),
        ('Safety', 'safety'),
        ('Future Growth', 'growth')
)
INSERT INTO public.decision_scores (
    decision_entity_id, 
    dimension_id, 
    score, 
    max_score, 
    confidence, 
    calculation_version
)
SELECT 
    de.id,
    dd.id,
    (rating->>'score')::numeric,
    10,
    LOWER(COALESCE(p.decision->>'confidence', 'medium')),
    'legacy-migration-v1'
FROM public.places p
JOIN public.decision_entities de ON de.entity_id = p.id AND de.entity_type = 'place',
LATERAL jsonb_array_elements(p.decision->'categoryRatings') AS rating
JOIN dimension_mapping dm ON dm.label = rating->>'label'
JOIN public.decision_dimensions dd ON dd.code = dm.code
WHERE rating->>'score' IS NOT NULL
ON CONFLICT (decision_entity_id, dimension_id) DO UPDATE 
SET 
    score = EXCLUDED.score,
    confidence = EXCLUDED.confidence,
    calculation_version = EXCLUDED.calculation_version,
    updated_at = now();

-- 4. Builder Migration
INSERT INTO public.decision_scores (
    decision_entity_id, 
    dimension_id, 
    score, 
    max_score, 
    confidence, 
    calculation_version
)
SELECT 
    de.id,
    dd.id,
    b.trust_score / 10.0,
    10,
    'medium',
    'legacy-migration-v1'
FROM public.builders b
JOIN public.decision_entities de ON de.entity_id = b.id AND de.entity_type = 'builder'
CROSS JOIN public.decision_dimensions dd
WHERE b.trust_score IS NOT NULL AND dd.code = 'builder_trust'
ON CONFLICT (decision_entity_id, dimension_id) DO UPDATE 
SET 
    score = EXCLUDED.score,
    calculation_version = EXCLUDED.calculation_version,
    updated_at = now();

-- 5. Documentation Comment
COMMENT ON TABLE public.decision_scores IS 'Normalized 0–10 representation does not by itself establish semantic comparability between entity scores. Cross-entity comparison requires compatible dimensions, methodology, evidence, confidence and calculation version.';

-- 6. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_scores TO authenticated;
GRANT SELECT ON public.decision_scores TO anon;
GRANT ALL ON public.decision_scores TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_entities TO authenticated;
GRANT SELECT ON public.decision_entities TO anon;
GRANT ALL ON public.decision_entities TO service_role;
GRANT SELECT ON public.decision_dimensions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_dimensions TO authenticated;
GRANT ALL ON public.decision_dimensions TO service_role;
