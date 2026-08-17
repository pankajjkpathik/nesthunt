# Plan: BUILD-030 — DECISION LAYER INTEGRITY & PROVENANCE ENGINE

Establish the integrity and provenance framework for Decision Intelligence, ensuring machine-readable methodology, traceability, and semantic control.

## 1. Database Schema Enhancements
Add provenance and semantic metadata fields to the Decision Layer tables.

- **decision_scores**:
    - Add `source_type` (text with check constraint).
    - Add `status` (text with check constraint, defaulting to 'draft').
- **decision_dimensions**:
    - Add `entity_applicability` (text[]).
    - Add `compatibility_group` (text).
    - Add `semantic_definition` (text).

## 2. Methodology & Provenance Registry
Establish formal identifiers and mapping for existing data.

- **Source Types**: `LEGACY_MIGRATION`, `CMS_ASSESSMENT`, `DERIVED_METRIC`, `VERIFIED_EVIDENCE`, `SYSTEM_CALCULATION`, `USER_INPUT`.
- **Methodology Versions**: `legacy-migration-v1` (preserved), `place-v1`, `builder-trust-v1`, `project-v1`.
- **Dimension Compatibility**: Initialize `compatibility_group` for Place dimensions to prevent incorrect cross-entity comparisons.

## 3. Implementation Steps
1. **Migration**: Execute SQL to add columns and update existing records from BUILD-029 with correct provenance markers.
2. **Service Layer**: Update `src/lib/services/decision-intelligence.ts` to support new fields in TypeScript types and CRUD operations.
3. **Data Integrity**: Update existing `decision_scores` to set `source_type = 'LEGACY_MIGRATION'` where applicable.
4. **Governance Report**: Generate a provenance completeness audit and classification of existing scores.

## Technical Details
- **RLS**: Policies will be updated to ensure `status` and `source_type` are respected in public queries.
- **Audit Logs**: All metadata changes will be captured by the existing `di_audit_row` trigger.
- **Backward Compatibility**: Legacy fields in `places` and `builders` tables remain authoritative for V1 modules.
