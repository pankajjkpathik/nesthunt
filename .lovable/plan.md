# Project Intake Admin UI Plan - LAUNCH-002N

## Objectives
- Build an internal Admin UI for the Project Intake Pipeline.
- Expose existing functionality: validation, duplicate protection, and draft-only creation.
- Support batch entry, multi-record editing, and retry workflows.

## Technical Details

### Route & UI
- **Route**: `/admin/projects/intake` (authenticated via `AdminGuard`).
- **Components**:
    - `ProjectIntakePage`: Main layout with batch controls.
    - Expandable rows for each project record.
    - Authoritative searchable selectors for Builder and Place (using existing `useAdminBuilders` and `useAdminPlaces` hooks).
    - Validation and execution status badges/feedback.

### Server Functions (`src/lib/project-intake.functions.ts`)
- `validateIntakeBatch`: Checks for duplicates (slug/RERA) and validates relationships (Builder/Place) without writing to DB.
- `executeIntakeBatch`: Proxies to `ProjectIntakeFactory.processBatch` for actual project creation.

### Factory Hardening (`src/lib/project-intake-factory.ts`)
- Updated `IntakeRecord` interface to support extended fields (starting price, possession, summary, etc.).
- Enhanced `processRecord` to populate the full project schema (metrics, hero, summary) while ensuring `publish_status = 'draft'`.
- Preserved all LAUNCH-002M invariants: duplicate protection, infrastructure registration (governance/decision entity), and NULL preservation.

### Workflow
1. Admin enters data (manual or duplicate/edit).
2. "Validate Batch" runs server-side checks.
3. "Create Draft Projects" becomes available only if all records are "READY".
4. Results dashboard shows created IDs with links to the Project CMS editor.
5. Corrections can be made to failed rows for retry.

## Security & Safety
- Privileged operations remain server-side using `supabaseAdmin`.
- No sensitive keys exposed to the client.
- All new projects are locked in `draft` status.
- No changes to public routes or frozen V1 intelligence modules.
