# BUILD-017B — Builder CMS Intelligence Data

Objective: Make the EXISTING Builder Admin CMS the authoritative interface for maintaining data consumed by the public Builder Intelligence page, using verified existing architecture.

## 1. Trace and Audit
- Audit `BuilderEditor.tsx` to identify existing fields.
- Verify JSONB metrics preservation in `src/lib/services/builders-admin.ts`.
- Inspect `place_risks`, `place_evidence`, and `place_promises` to confirm if they support builder entities (done: they have `builder_id` in types but not in schema yet, or they use generic `entity_risks`).
- *Correction*: psql shows `place_risks` does NOT have `builder_id`. However, `entity_risks` and `promise_ledgers` tables exist and are designed for generic entities. `useBuilderRisks` in `usePlaceIntelligence.ts` incorrectly queries `place_risks` with `builder_id` filter which will fail.

## 2. Infrastructure & Services
- Update `src/lib/services/builders-admin.ts` to support all enterprise fields and ensure JSONB metrics preservation.
- Fix `src/hooks/usePlaceIntelligence.ts` to use `RiskService` and `PromiseLedgerService` from `decision-intelligence.ts` for builders, instead of querying `place_risks` table.
- Update `src/lib/services/builders-public.ts` to source Risks/Promises from the generic `entity_risks` and `promise_ledgers` tables for builders.

## 3. CMS Enhancements (`BuilderEditor.tsx`)
- **General Tab**: Ensure Builder Name, Slug, Logo, Short Description, Executive Summary, Founded Year, Headquarters, Website, Company Type are editable.
- **Metrics Tab**: Support manually maintained metrics (Completed, Ongoing, Upcoming, Cities, Homes, Customers) stored in `builders.metrics` JSONB.
- **Trust Tab**: Expose `trust_score` and `trust_breakdown` (Experience, Delivery, Legal, Customer, Financial).
- **Leadership/RERA Tabs**: Bind to `builder_leadership` and `builder_rera_records` tables.
- **Risks/Evidence/Promises Tabs**: Use generic intelligence components (RisksTab, EvidenceTab, PromiseLedgerTab) backed by `entity_risks` etc.

## 4. Public Page Validation
- Ensure `src/routes/builders.$slug.tsx` consumes the new data sources (generic risks/promises).
- Verify "Assessment Pending" empty state for missing scores.

## Technical Details
- **Metrics JSONB**: Form state will hold visible metrics, but save payload will merge with `existing.metrics` to preserve unknown fields.
- **Generic Intelligence**: Transition builder risks/promises from `place_risks` (which was a misconfiguration in previous builds) to the specialized `entity_risks` and `promise_ledgers` tables.
- **RBAC**: Reuse existing `admin`/`editor` role checks.
