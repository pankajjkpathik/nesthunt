-- 1. Infrastructure placeholder marker on decision_scores
ALTER TABLE public.decision_scores
  ADD COLUMN IF NOT EXISTS is_placeholder boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.decision_scores.is_placeholder IS
  'TRUE = infrastructure-only score shell required to anchor evidence/factors. Never an assessment. Must never be published, ranked, averaged or exposed publicly.';

UPDATE public.decision_scores
SET is_placeholder = true
WHERE id IN (
  '9e4c4153-6ca3-4381-a468-e8159046ec43',
  '512810dd-c48c-47f5-aea2-059494412a51',
  '560f78d7-2cbf-429c-8e7e-46ab9bff947a',
  '8886b88f-1937-44dc-b056-d733a8ffb653',
  '3e226513-cf8e-45d0-8337-8c40eea7347b',
  '19a6c3c6-1d65-49ff-962e-3d302759ba0c',
  '002d40cd-bad6-4349-9530-b59c6ad3a6d6',
  'bf61e54a-f613-46d4-8738-d9c255b20fb5',
  '17646d0e-7f2b-4b65-85c1-3d68a66638d4',
  '8af7da49-369b-4b2b-8477-2947812ddd6d'
);

-- Placeholders can never be published
ALTER TABLE public.decision_scores
  DROP CONSTRAINT IF EXISTS decision_scores_placeholder_not_published;
ALTER TABLE public.decision_scores
  ADD CONSTRAINT decision_scores_placeholder_not_published
  CHECK (NOT (is_placeholder AND status = 'published'));

-- 2. Operational record classification on project_governance
ALTER TABLE public.project_governance
  ADD COLUMN IF NOT EXISTS record_classification text NOT NULL DEFAULT 'PRODUCTION';

ALTER TABLE public.project_governance
  DROP CONSTRAINT IF EXISTS project_governance_record_classification_check;
ALTER TABLE public.project_governance
  ADD CONSTRAINT project_governance_record_classification_check
  CHECK (record_classification IN ('PRODUCTION','TEST_ARTIFACT','QUARANTINED'));

-- 3. Backfill governance rows for projects that lack one
INSERT INTO public.project_governance (project_id, intake_status, verification_level)
SELECT p.id, 'DRAFT', 'STANDARD'
FROM public.projects p
WHERE NOT EXISTS (SELECT 1 FROM public.project_governance g WHERE g.project_id = p.id);

-- 4. Classify test artifacts
UPDATE public.project_governance g
SET record_classification = 'TEST_ARTIFACT'
FROM public.projects p
WHERE p.id = g.project_id
  AND p.slug IN (
    'intake-test-alpha','intake-test-beta','qa-test-project','rera-test-project',
    'rera-intake-project','sparse-intake-project','sparse-project',
    'repeated-builder-1','repeated-builder-2','valid-project-beta',
    'scale-test-1','scale-test-2','scale-test-3','scale-test-6',
    'scale-test-7','scale-test-8','scale-test-9','scale-test-10'
  );

-- 5. Quarantine Valid Project Alpha
UPDATE public.project_governance g
SET record_classification = 'QUARANTINED'
FROM public.projects p
WHERE p.id = g.project_id AND p.slug = 'valid-project-alpha';