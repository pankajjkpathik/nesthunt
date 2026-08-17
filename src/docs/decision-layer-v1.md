# Decision Layer V1 Documentation

## DECISION LAYER V1 FROZEN
**Status**: FROZEN (BUILD-035)
**Date**: 2026-08-17
**Scope**: Normalization, Provenance, Compatibility, Journey, and Transparent Comparison.

---

## 1. Ownership Boundary
The Decision Layer is the analytical heart of NestHunt. It transforms raw data into structured intelligence.
- **Owned**: Normalized scores, dimensions, provenance, semantic compatibility, factors, evidence, risks, promises, comparison logic, Journey context, and user criteria.
- **Not Owned**: Raw entity metadata (Project/Builder/Place details), pricing, inventory, CMS content, auth, or billing.

## 2. Score Normalization
All Decision Layer scores are normalized to a strict **0.00 – 10.00** scale.
- **Max Score**: 10.00
- **Scale Mapping**:
  - Builder Trust (legacy 0-100) -> 0.00-10.00
  - Place Scores (0-10) -> 0.00-10.00
  - Project Scores: NOT IMPLEMENTED.

## 3. Provenance Framework
Every score must be traceable.
- **Source Types**: `LEGACY_MIGRATION`, `CMS_ASSESSMENT`, `DERIVED_METRIC`, `VERIFIED_EVIDENCE`, `SYSTEM_CALCULATION`, `USER_INPUT`.
- **Classification**:
  - `VERIFIED`: High confidence + verified evidence.
  - `PLACEHOLDER`: System placeholders (e.g., v1_migration with 0.00 score).
  - `LEGACY`: Migrated from previous versions.

## 4. Semantic Compatibility
Managed via `compatibility_group`.
- **Groups**: `place_standard_v1`, `builder_standard_v1`.
- **Rule**: Dimensions are only comparable if they share a compatibility group. Never merge groups based on label similarity alone.

## 5. Journey & User Criteria
- **Journey**: Local-only workspace (localStorage). Stores entity refs and `savedAt`.
- **Criteria**: User priorities (High/Medium/Low/None). Used for highlighting/sorting in comparison, NEVER for modifying source scores or generating rankings.

## 6. Transparent Comparison
- **Scope**: Project vs Project (2-3 entities).
- **Output**: Side-by-side matrix of facts, assessments, risks, and promises.
- **Hard Constraints**: No aggregate scores, no match percentages, no winners, no recommendations.

## 7. Ten Core Invariants
1. A Place score must never become a Project score.
2. A Builder Trust score must never become a Project score.
3. NULL never becomes zero.
4. Placeholder never becomes assessment.
5. User preference never changes source data.
6. Incompatible dimensions never become comparable.
7. Unpublished data never becomes public.
8. Risks never become hidden ranking.
9. Promises never become hidden ranking.
10. Comparison never produces an implicit winner.

## 8. Post-Freeze Change Protocol
Any modification requires a new approved build with:
1. Explicit build number.
2. Defined objective & scope.
3. Acceptance criteria & regression testing.

## 9. Structural Limitations
- No server-side Journey persistence.
- No aggregate or personalized scoring.
- No AI-generated recommendations.
- No SaaS/multi-tenancy implementation.
