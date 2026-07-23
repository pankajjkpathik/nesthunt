# BUILD-015 — Structured Content Engine

Extend NHOS with four reusable content modules (Categories, Amenities, Nearby Infrastructure, Unit Types), fully integrated with the existing Relationship Engine, Media Library, Admin CMS, and design system. No UI redesign, no direct Supabase calls from components.

## 1. Database (single migration)

Four new content tables plus supporting tables. All follow the NHOS pattern: CREATE → GRANT (authenticated + service_role, anon SELECT for published) → RLS → policies → updated_at trigger.

- `public.categories` — id, name, slug (unique), parent_id (self-FK, nullable), description, icon (text/lucide name), featured_image_id (media), status ('draft'|'published'), seo (jsonb), sort_order, created_at, updated_at.
- `public.amenities` — id, name, slug (unique), category (text enum-like: lifestyle/sports/security/health/convenience/green/utilities/children/senior/business), description, icon, illustration_id (media), featured (bool), status, seo, sort_order, timestamps.
- `public.infrastructure_items` — id, name, slug, category (text: hospital/school/university/metro/…), description, latitude, longitude, address, city, state, website, phone, hours, image_id (media), status, timestamps.
- `public.unit_types` — id, name, slug, category (residential/commercial), bedrooms, bathrooms, balconies, super_area_min, super_area_max, carpet_area_min, carpet_area_max, facing, floor_plan_id (media), description, timestamps.
- `public.infrastructure_links` — join for infra ↔ (place|project) with `entity_type`, `entity_id`, `distance_km`, `notes`, unique(infrastructure_id, entity_type, entity_id). Kept as a dedicated table so distance is first-class (Relationship Engine edges don't carry typed distance).

Extend `EntityType` in `entity_relationships` semantics by using existing generic edges for category/amenity/unit_type attachments (kinds: `categories`, `amenities`, `unit_types`). Add `check_relationship_valid` cases where useful; otherwise rely on catalog.

Anon SELECT is limited to `status = 'published'`. Admin writes gated by `has_role(auth.uid(),'admin')`.

## 2. Services (`src/lib/services/`)

- `categories.ts` — list/get/create/update/delete/duplicate, tree helpers (`getTree`, `getAncestors`), usage counts via relationships.
- `amenities.ts` — CRUD, bulk publish/draft/delete, featured toggle, merge duplicates.
- `infrastructure.ts` — CRUD + link/unlink/updateDistance against places & projects (`infrastructure_links`).
- `unitTypes.ts` — CRUD, attach/detach to projects (via relationships, kind `unit_types`, meta = { price_from, price_to } for per-project overrides).
- `structuredHealth.ts` — aggregates unused/duplicates/missing-icons/missing-seo across the four modules.

All hit Supabase; components never do.

## 3. React Query hooks (`src/hooks/`)

- `useCategories.ts` — `useCategories`, `useCategoryTree`, `useCategory`, mutations (create/update/delete/duplicate/bulk).
- `useAmenities.ts` — parallel API.
- `useInfrastructure.ts` — list/detail + link mutations with distance.
- `useUnitTypes.ts` — list/detail + project-attach mutations.
- `useStructuredHealth.ts` — dashboard aggregate.

Consistent query keys, invalidation on writes, optimistic updates for toggles.

## 4. Admin routes (file-based, dot convention)

Under `src/routes/`:

- `admin.categories.index.tsx`, `admin.categories.new.tsx`, `admin.categories.$id.tsx`
- `admin.amenities.index.tsx`, `admin.amenities.new.tsx`, `admin.amenities.$id.tsx`
- `admin.infrastructure.index.tsx`, `admin.infrastructure.new.tsx`, `admin.infrastructure.$id.tsx`
- `admin.unit-types.index.tsx`, `admin.unit-types.new.tsx`, `admin.unit-types.$id.tsx`
- `admin.content-health.index.tsx`

Each listing reuses the existing enterprise listing pattern (search, filters, pagination, sort, bulk actions, dependency-aware delete via `DependencyDialog`).

Each editor reuses `Fields`, `MediaField`, `RelationshipsTab`, `UsagePanel` from existing admin components.

## 5. Reusable UI

- `src/components/admin/content/ContentPicker.tsx` — one dialog that picks Categories | Amenities | Infrastructure | Unit Types (mode prop). Search, category filter, multi-select, grouped results. Replaces bespoke pickers going forward.
- `src/components/admin/content/CategoryTree.tsx` — nested tree with drag-free reparenting via select.
- `src/components/admin/content/InfrastructureLinkRow.tsx` — distance-km editable row for place/project editors.
- `src/components/admin/content/UnitTypeAttachRow.tsx` — attach + per-project price override for project editor.

## 6. Editor integrations (minimal, additive)

- `PlaceEditor` — add "Categories", "Amenities", "Nearby Infrastructure" panels (Infrastructure uses `InfrastructureLinkRow` with distance).
- `BuilderEditor` — add "Categories".
- `ProjectEditor` — add "Categories", "Amenities", "Unit Types" (with per-project pricing override), "Nearby Infrastructure".

Panels reuse `RelationshipPanel` where the relationship is a simple typed edge; use the new distance/price rows only where extra metadata matters.

## 7. Navigation

Update `src/lib/admin/nav.ts`: new "Content Library" group containing Categories, Amenities, Infrastructure, Unit Types; add "Content Health" under Operations.

## 8. Types (`src/types/content.ts`)

Central interfaces for `Category`, `Amenity`, `InfrastructureItem`, `UnitType`, `InfrastructureLink`, `AmenityCategory`, filter/sort/query params. No `any`.

## 9. Health dashboard

`admin.content-health.index.tsx` shows unused entries, missing icons, missing SEO, potential duplicates (name+slug fuzzy match within a module), broken relationships. Quick-action buttons route to the relevant editor.

## 10. Out of scope (explicit)

No AI, no maps, no distance APIs, no import wizards, no external data providers. Bulk import/export scaffolding only — buttons disabled with "coming soon".

## Technical section

- Migration order: types → tables → grants → RLS → policies → triggers → RPCs (`content_unused_*`, `content_duplicates`).
- Distance stored in km as `numeric(6,2)` on `infrastructure_links`.
- Category tree loaded via one flat query, assembled client-side (memoized).
- Query keys: `['categories', filters]`, `['category', id]`, similarly for the other three; `['content-health']`.
- All new tables: `updated_at` maintained by shared `set_updated_at` trigger.
- Anon policies: `USING (status = 'published')` for the four content tables; infrastructure_links inherits visibility from the linked entity (anon SELECT allowed since coordinates/distance are public content).
- Delete flow reuses existing `DependencyDialog` with usage payload from `getUsage`-equivalent per module (relationships table + infrastructure_links).

Ready to implement on approval.