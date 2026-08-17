# BUILD-024 — PROJECT CMS INTELLIGENCE & DATA INTEGRITY

This plan ensures the Project Admin CMS becomes the authoritative source for all Project Intelligence data, utilizing existing generic intelligence architectures while maintaining data integrity.

## CMS Integration & Authoritative Data
- **Project Editor (Auth Source):** Update `ProjectEditor.tsx` to handle all intelligence fields consumed by `/projects/:slug`.
- **Executive Summary:** Ensure the `executive_summary` field is fully editable and synchronized.
- **Hero & Media:** Integrate DAM (MediaPicker) for Hero and Gallery images, maintaining legacy URL compatibility.
- **Quick Facts & Metrics:** Map public Quick Facts to CMS fields and use JSONB merge semantics for `metrics` to preserve non-CMS keys.
- **Structured Content:** Use existing architectures for **Unit Types**, **Amenities**, and **Nearby Infrastructure**.

## Decision Intelligence Layer Migration
- **Strengths:** Migrate from legacy array to generic `decision_factors` architecture (entity_type = project).
- **Risks:** Migrate to generic `entity_risks` architecture (entity_type = project).
- **Promises:** Migrate to generic `promise_ledgers` architecture (entity_type = project).

## Technical Implementation
- **Admin Service:** Create `projects-cms-integration.ts` to manage complex updates and integrity.
- **Hooks:** Update `useAdminDecisionIntelligence.ts` to support project-specific query invalidation.
- **Components:** Create `DecisionFactorsTab.tsx` and refactor `RisksTab.tsx` / `PromisesTab.tsx` for project support.
- **Data Integrity:** Implement JSONB merging and array ordering preservation in `adminUpdateProject`.

## Validation & Verification
- Verify CMS sync to public `/projects/:slug`.
- Ensure **Builder Intelligence V1** and **Place Intelligence** remain unchanged.
- Validate publication workflow (Draft/Review/Published).

---
## Technical Details
- **Schema:** `projects`, `decision_entities`, `decision_factors`, `entity_risks`, `promise_ledgers`.
- **Cache Management:** TanStack Query key invalidation (diKey pattern).
- **Permissions:** Reuses existing Admin/Editor roles.
- **Migration Path:** Legacy fields (risks/strengths/legal) are preserved for backward compatibility but managed via new tabs.
