# BUILD-026 — PROJECT INTELLIGENCE PRODUCTION QA & HARDENING

This plan focuses on auditing, hardening, and verifying the Project Intelligence module (V1) to ensure production readiness. It covers data synchronization, security, responsive design, and removal of mock data.

## 1. Data Service Hardening
- Update `ProjectPublicService` in `src/lib/services/projects-public.ts` to fetch `decision_insights` for the Intelligence Summary.
- Ensure all queries are correctly scoped to `publish_status = 'published'` and the specific `entity_id`.

## 2. UI Component Hardening (Mock Data Removal)
- **`ProjectIntelligenceSummary.tsx`**: Replace hardcoded insights with live data from `decision_insights`. Implement a graceful fallback for missing data.
- **`ProjectEntityRelationships.tsx`**: Fix hardcoded locality link to use `project.place.slug` if available.
- **`ProjectHero.tsx` & `ProjectQuickFacts.tsx`**: Verify formatting logic for prices and metrics, ensuring no mock fallbacks are used.
- **`ProjectDueDiligence.tsx`**: Verify content is neutral and generic as intended.

## 3. CMS & Sync Verification
- Audit `ProjectAdminService` to ensure `updateProjectIntelligence` preserves JSONB keys in `metrics` (verified in code, will verify with a test).
- Ensure RERA and documentation fields in CMS correctly map to public UI.

## 4. Security & RLS Audit
- Verify that `decision_insights` and `entity_risks` RLS policies correctly filter by `publish_status` via the `di_entity_published` function.
- Confirm no service-role keys are exposed.

## 5. Routing & SEO Verification
- Verify the legacy `/project/:slug` redirect.
- Confirm `sitemap.ts` correctly excludes non-published projects.
- Ensure 404 state for unpublished or non-existent projects.

## 6. Verification
- Final production build check.
- TypeScript check.
- Regression check for Builder and Place Intelligence.

## Technical Details
- **Tables impacted**: `projects`, `decision_insights`, `entity_risks`, `promise_ledgers`, `decision_entities`.
- **Components impacted**: `ProjectIntelligenceSummary`, `ProjectEntityRelationships`, `ProjectHero`, `ProjectQuickFacts`.
- **Services impacted**: `ProjectPublicService`, `DecisionInsightService`.
