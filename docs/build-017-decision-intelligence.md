# BUILD-017 — Decision Intelligence Layer

Generic, reusable intelligence architecture. Attaches to any entity
(place, builder, project, school, hospital, infrastructure, future types)
without duplicating the existing CMS or altering existing tables.

## Schema

| Table | Purpose |
|---|---|
| `decision_entities` | Intelligence-bearing wrapper `(entity_type, entity_id)` with lifecycle `draft/review/published/archived`. |
| `decision_dimensions` | Master list of scoring dimensions (seeded with 10 defaults). |
| `decision_scores` | One score per `(decision_entity_id, dimension_id)` — includes weight, confidence, `calculation_version`. |
| `decision_factors` | Reasons behind a score (positive/negative/neutral, impact 1–10). |
| `decision_evidence` | Sourced proof for a factor. Links to `media_assets`. Verification workflow: pending / verified / rejected. |
| `decision_recommendations` | Persona-based verdicts (family/investor/luxury/student/nri/retiree). |
| `decision_insights` | Human-readable intelligence cards. |
| `promise_ledgers` | Generic promise tracker (works for any entity type). |
| `entity_risks` | Generic risk register (works for any entity type). |
| `audit_logs` | Governance trail — populated by triggers. |

Cascade rules: scores → factors → evidence cascade delete. Dimensions restrict-delete (cannot drop a dimension while scores reference it). Media asset FK on evidence is `SET NULL`.

## Roles (RBAC extension)

`app_role` enum extended with `editor`, `reviewer`, `publisher` on top of existing `admin`, `moderator`, `user`.

| Capability | admin | publisher | reviewer | editor | moderator | user | anon |
|---|---|---|---|---|---|---|---|
| Read all rows | ✓ | ✓ | ✓ | ✓ | ✓ | – | – |
| Read published only | – | – | – | – | – | ✓ | ✓ |
| Create / edit intelligence | ✓ | ✓ | ✓ | ✓ | ✓ | – | – |
| Verify evidence | ✓ | ✓ | ✓ | – | ✓ | – | – |
| Publish / archive entity | ✓ | ✓ | – | – | – | – | – |
| Manage dimensions | ✓ | – | – | – | – | – | – |
| Delete evidence / entity | ✓ | – | – | – | – | – | – |
| Read audit logs | ✓ | – | – | – | – | – | – |

Public read is gated by `di_entity_published(decision_entity_id)`, so evidence, scores, factors, insights, recommendations, promises and risks only appear once the associated `decision_entities` row is `published`. Evidence additionally requires `verification_status = 'verified'` for public reads.

## Triggers

- `di_touch_updated_at` — updates `updated_at` on every UPDATE.
- `di_audit_row` — writes an `audit_logs` entry on every INSERT/UPDATE/DELETE across all intelligence tables and dimensions.

## Indexes

`decision_entities(entity_type)`, `(entity_id)`, `(status)`, unique `(entity_type, entity_id)`; `decision_scores(decision_entity_id)`, `(dimension_id)`, unique `(decision_entity_id, dimension_id)`; `decision_factors(decision_score_id)`; `decision_evidence(decision_factor_id)`, `(verification_status)`; `decision_recommendations(decision_entity_id)`, unique `(decision_entity_id, persona)`; `decision_insights(decision_entity_id)`, `(is_featured)`; `promise_ledgers(entity_type, entity_id)`, `(status)`; `entity_risks(entity_type, entity_id)`, `(severity)`; `audit_logs(table_name)`, `(row_id)`, `(actor_id)`, `(created_at DESC)`.

## Services (`src/lib/services/decision-intelligence.ts`)

`DecisionEntityService`, `DecisionDimensionService`, `DecisionScoreService`, `DecisionFactorService`, `DecisionEvidenceService`, `DecisionRecommendationService`, `DecisionInsightService`, `PromiseLedgerService`, `RiskService` — all strict-typed against generated `Database` types, no `any`.

Notable helpers:
- `DecisionEntityService.ensure(entityType, entityId)` — get-or-create wrapper for attaching intelligence to an existing entity.
- `DecisionScoreService.upsert(...)` — idempotent per `(decision_entity_id, dimension_id)`.
- `DecisionRecommendationService.upsert(...)` — idempotent per `(decision_entity_id, persona)`.
- `DecisionEvidenceService.verify(id, status)` — stamps `verified_by` + `verified_at`.

## React Query hooks (`src/hooks/useDecisionIntelligence.ts`)

Query hooks: `useDecisionEntities`, `useDecisionEntity`, `useDecisionEntityByRef`, `useDecisionDimensions`, `useDecisionScores`, `useDecisionFactors`, `useDecisionEvidence`, `useDecisionRecommendations`, `useDecisionInsights`, `usePromiseLedger`, `useEntityRisks`.

Mutations: `useEnsureDecisionEntity`, `useCreate/Update/DeleteDecisionEntity`, `useSetDecisionEntityStatus`, `useCreate/Update/DeleteDimension`, `useUpsert/Update/DeleteDecisionScore`, `useCreate/Update/DeleteDecisionFactor`, `useCreate/Update/DeleteDecisionEvidence`, `useVerifyDecisionEvidence`, `useUpsert/Update/DeleteDecisionRecommendation`, `useCreate/Update/DeleteDecisionInsight`, `useCreate/Update/DeletePromiseLedger`, `useCreate/Update/DeleteEntityRisk`.

Key namespace: `diKeys.*` — stable, invalidation-friendly.

## Out of scope (per spec)

No UI, pages, charts, AI, calculations, narrative generation, compare, PDF, search, analytics, or scoring formula. Architecture only.

## Integration notes

- Coexists with the existing place-scoped tables (`place_evidence`, `place_risks`, `place_promises`). Nothing was migrated or removed; teams can adopt the new generic layer entity-by-entity.
- Uses the existing `media_assets` table for evidence attachments.
- RLS helpers (`di_can_edit`, `di_can_review`, `di_can_publish`) compare `user_roles.role::text` to avoid the "unsafe use of new enum value" error and remain compatible with the existing `has_role()` function used across the app.
