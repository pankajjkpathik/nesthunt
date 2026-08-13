# Plan — Builder Intelligence CMS Foundation (BI-001)

Upgrade the existing Builder CMS into a complete Builder Intelligence module, extending the data model and UI to support structured evidence, risks, and repeatable intelligence collections.

## User Review Required

> [!IMPORTANT]
> - I will extend the `builders` table and create 4 new child tables (`builder_leadership`, `builder_certifications`, `builder_awards`, `builder_rera_records`, `builder_faqs`).
> - I will reuse the generic `entity_risks` and `promise_ledgers` tables created in BUILD-017 for Builder risks and delivery tracking.
> - I will reuse the generic `decision_evidence` system for backing specific intelligence claims.

## Proposed Changes

### Database (Supabase)
- **Extend `builders` table**:
    - Add `legal_name` (text), `mission` (text), `vision` (text), `operating_years_manual` (integer, for overrides).
    - Add `portfolio_stats_manual` (jsonb) for verified stats overrides.
    - Add `delivery_stats_manual` (jsonb) for manually verified delivery data.
- **Create Child Tables**:
    - `builder_leadership`: name, designation, bio, photo_id (fkey to media), linked_in, display_order.
    - `builder_certifications`: name, issuer, issue_date, expiry_date, description, media_id (fkey to media), display_order.
    - `builder_awards`: name, issuer, year, description, media_id (fkey to media), display_order.
    - `builder_rera_records`: registration_number, state, authority, registration_url, registration_date, expiry_date, status (enum), notes.
    - `builder_faqs`: question, answer, display_order, is_published.
- **RLS**: Apply standard RBAC policies (Admins full CRUD, Editors/Reviewers partial, Public READ published).

### Service Layer & Hooks
- Update `builders-admin.ts` with typed CRUD for all new child collections.
- Add `useBuilderIntelligence.ts` TanStack Query hooks for leadership, awards, RERA, etc.
- Integrate with generic `DecisionIntelligence` service for Risks and Promises.

### Admin UI
- **Refactor `BuilderEditor.tsx`**:
    - Add 13 dedicated tabs as requested (Overview, Company, Leadership, Market, Segments, Portfolio, Regulatory, Certifications, Awards, Delivery, Risks, FAQ, Media).
    - Implement inline editors for all repeatable collections (similar to `PlaceEditor`).
    - Add a "Publish Readiness" gate.

## Technical Details
- **Migration**: SQL file adding columns and creating 5 child tables with RLS and Audit triggers.
- **Types**: Sync `src/types/index.ts` and `builders-admin.ts` with new schema.
- **Media**: All image fields will use `MediaPicker` to link to existing `media_assets`.
- **Relationships**: Continue using the Relationship Engine for Place and Project connections.

## Timeline
1. Database Migration & Types
2. Service Layer & Hooks
3. UI Refactoring (Tabs & Editors)
4. Verification & Hardening
