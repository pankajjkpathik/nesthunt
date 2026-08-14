# Plan: Builder Data Integrity & Public Page Validation (BUILD-017A)

Harden the public Builder Detail page (`/builders/:slug`) to ensure it is driven by live NHOS/Supabase data without visual changes or fabricated metrics.

## User Review Required

> [!IMPORTANT]
> - This task involves removing hardcoded placeholders. Sections without data in the CMS (like "Regulatory") will either be hidden or show a clean "Assessment Pending" state.
> - **Trust Score:** If no breakdown exists in the CMS, it will show "Assessment Pending" instead of the current hardcoded "8.8/10".

## Proposed Changes

### 1. Data Service Hardening
- **Fetch Intelligence Child Tables:** Update `BuilderPublicService` to fetch:
  - `place_evidence` (linked via `builder_id`)
  - `place_risks` (linked via `builder_id`)
  - `place_promises` (linked via `builder_id`)
- **Strict Relationship Filter:** Ensure only `published` projects are returned in the portfolio.

### 2. Builder Detail Route Refactor (`src/routes/builders.$slug.tsx`)
- **Replace Placeholders:** Replace `PlaceholderCard` with functional components for:
  - **Portfolio:** Grid of live projects linked to the builder.
  - **Risks & Intelligence:** Render live risks/evidence if present.
- **Derived Metrics:** Derive "Years in Business" from `year_established`.
- **Empty States:** Hide sections where data is entirely missing (Regulatory, FAQ) until populated in CMS.

### 3. Component Updates
- **BuilderHero:** Ensure Trust Score and KPIs (Completed/Ongoing Projects) use live CMS fields. Fallback to "NA" or hide if missing.
- **DecisionScoreCard:** Integrate for Trust Score breakdown.
- **InsightListCard:** Integrate for Strengths/Watch-outs.

## Technical Details

- **Mapping:**
  - `trust_score` -> `builders.trust_score`
  - `trust_breakdown` -> `builders.trust_breakdown` (JSON)
  - `portfolio` -> `relationships` -> `projects` (where status = published)
  - `risks` -> `place_risks` table
- **Performance:** Use existing TanStack Query caching (5m). Avoid N+1 by fetching relationships in a single batch.
- **TypeScript:** Use generated `Database` types; no `any`.
