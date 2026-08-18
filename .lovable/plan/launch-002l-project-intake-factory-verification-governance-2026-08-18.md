# LAUNCH-002L — Project Intake Factory & Verification Governance

Implement a lightweight governance layer for Project onboarding to distinguish verification levels and track exceptions without affecting public intelligence scores.

## User Review Required

> [!IMPORTANT]
> - New table `project_governance` will be created to store intake state.
> - New table `project_exceptions` will be created for tracking RERA/data conflicts.
> - These are internal-only admin fields and will not be exposed to public users or affect scores.

## Proposed Changes

### Database & Schema
- Create `project_governance` table:
    - `id` (UUID, PK)
    - `project_id` (UUID, FK to projects, Unique)
    - `intake_status` (Enum: DRAFT, DATA_REVIEW, VERIFIED)
    - `verification_level` (Enum: STANDARD, ENHANCED, DEEP_REVIEW)
- Create `project_exceptions` table:
    - `id` (UUID, PK)
    - `project_id` (UUID, FK to projects)
    - `type` (Enum: RERA_CONFLICT, IDENTITY_CONFLICT, etc.)
    - `status` (Enum: OPEN, RESOLVED, WAIVED)
    - `note` (Text)
- Enable RLS: `authenticated` (admin role) can CRUD; `anon` has no access.
- Add `GRANT` statements for `authenticated` and `service_role`.

### Services & Hooks
- Create `src/lib/services/project-governance.ts`:
    - CRUD for governance and exceptions.
    - Deterministic readiness calculation logic.
    - Integration with existing `audit_logs` for all state changes.
- Create `src/hooks/useProjectGovernance.ts`:
    - React Query hooks for fetching and mutating governance data.

### Admin UI
- Modify `src/components/admin/ProjectEditor.tsx`:
    - Add "Intake & Verification" tab.
    - Display intake status, verification level, and exception list.
    - Add UI to create/resolve exceptions and factual notes.
    - Show Publication Readiness check (blocking/non-blocking indicators).
- Modify `src/routes/admin.projects.index.tsx`:
    - Add lightweight summary counts at the top (Ready for QA, Needs Review, etc.).

### Data Validation
- **Gardenia Floors**: Set to `STANDARD` verification, 0 open exceptions, `intake_status = VERIFIED`.
- **Celestia Royal 2C**: Set to `ENHANCED` verification, 1 open exception (`REGULATORY_REFERENCE`), `intake_status = DATA_REVIEW`.

## Technical Details

- **Readiness Logic**: 
    - Required: Name, Slug, Builder (for public UI), Place (for public UI), RERA (if applicable).
    - Blocked by: `OPEN` exceptions of type `REGULATORY_REFERENCE` or `IDENTITY_CONFLICT`.
- **Audit Logging**: Every state transition will insert a row into `audit_logs` with `table_name = 'project_governance'` or `'project_exceptions'`.
- **Performance**: Governance data loaded only in `ProjectEditor` via suspense-enabled hooks.
