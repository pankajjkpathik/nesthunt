# BUILD-014 — Relationship Engine & Knowledge Graph

Extend NHOS with a centralized relationship layer that every module consumes. Zero UI redesign — reuse existing shell, tabs, cards, and design tokens.

## 1. Data model (single migration)

Introduce a generic edge table plus specific typed joins where uniqueness matters. This lets rare/new relationship types be added without schema churn while keeping strong constraints on the important ones.

```text
entity_relationships (generic edges)
  id, from_type, from_id, to_type, to_id, kind, sort_order, meta jsonb, created_at
  UNIQUE (from_type, from_id, to_type, to_id, kind)
  CHECK (from_type/to_type in known enum)
  Indexes on (from_type,from_id,kind) and (to_type,to_id,kind)

place_amenities         (place_id, amenity)          -- taxonomy tags
project_amenities       (project_id, amenity, category)
project_unit_types      (project_id, label, size_sqft, price)
place_nearby_infra      (place_id, label, category, distance_km)
construction_updates    (project_id, dated_on, note, media_asset_id)
```

Reuse existing tables where present: `builders.place_id`/`builder_places`, `projects.builder_id`/`place_id`, `media_usages`, `entity_documents`, `entity_scores`, `entity_images`. The generic edge table absorbs everything else (Places↔Categories, Blog↔Media, Builder↔Awards references, etc.).

RLS: `SELECT` for anon+authenticated; write only for admins (via `has_role`). GRANTs alongside.

## 2. Service layer (`src/lib/services/relationships.ts`)

Single façade for every module. All existing admin services delegate here.

- `attachEntity({from, to, kind})`
- `detachEntity({from, to, kind})`
- `syncRelationships({from, kind, targets})` — replaces the set
- `getRelatedEntities({from, kind?, toType?})` → hydrated summaries (name/slug/thumb)
- `getEntityGraph(from, depth=1)` → typed tree
- `getUsage(entity)` → counts per module + sample links
- `moveRelationship`, `replaceRelationship`
- `validateAttach(...)` — enforces:
  - project → exactly one builder / one place
  - no self-links, no duplicates
  - kind allowed for the (fromType,toType) pair

`src/lib/services/entityGraph.ts` — pure builders that shape service output into `GraphNode[]`.
`src/lib/services/usage.ts` — orphan/broken-reference queries used by the health dashboard.

Central types in `src/types/relationships.ts` (`EntityType`, `EntityRef`, discriminated `RelationshipKind`, `EntitySummary`, `GraphNode`, `UsageReport`).

## 3. React Query hooks (`src/hooks/useRelationships.ts`)

`useRelatedEntities`, `useEntityGraph`, `useEntityUsage`, `useAttachEntity`, `useDetachEntity`, `useSyncRelationships`, plus thin wrappers `useRelatedProjects/Builders/Places`. Optimistic updates on attach/detach; cache keys `["relationships", fromType, fromId, kind]`.

## 4. Reusable UI

- `EntityPicker` (`src/components/admin/relationships/EntityPicker.tsx`)
  - Command-palette style dialog built on shadcn `Command`
  - Props: `types: EntityType[]`, `multiple`, `excludeIds`, `onSelect`
  - Instant search (debounced), grouped by type, keyboard nav, lazy pages of 25
- `RelationshipPanel` — list + inline attach/detach for one `(entity, kind)`
- `RelationshipsTab` — bundles the panels an entity supports (Place: Builders / Projects / Categories / Amenities / Nearby / Media / Documents; Builder: Places / Projects / Awards / Leadership / Media / Documents; Project: Builder / Place / Amenities / Unit types / Media / Documents / Updates; Media: linked entities via `media_usages`)
- `EntityGraphView` — collapsible tree using existing card tokens; groups by kind
- `DependencyDialog` — shown before delete; lists dependents with counts and drill-down
- `UsagePanel` — reusable "Used in …" card for any entity

## 5. Editor integration

Add a **Relationships** tab to `PlaceEditor`, `BuilderEditor`, `ProjectEditor` rendering `RelationshipsTab`. Add a **Usage** tab. Replace the existing bespoke builder↔place attach UI with `RelationshipPanel`. In `AssetDetails` (Media Library), replace the current usage list with the shared `UsagePanel`.

Wire delete buttons in the three listing pages through `DependencyDialog` — bulk deletes reuse the same guard.

## 6. Relationship search

Extend list pages with new filters powered by the engine:
- Places: "without projects", "without builders"
- Builders: "without projects", "without logo"
- Projects: "orphaned (no builder or place)", "missing SEO"
- Media: "unused"

Implemented as query params → `useRelationships` filters; no new pages.

## 7. Relationship health dashboard

New route `src/routes/admin.relationships.index.tsx`:
- KPI row: total relationships, orphaned projects, unlinked media, builders w/o projects, places w/o builders, missing SEO, broken refs
- Section per issue with resolve links
- Nav entry added under Operations in `src/lib/admin/nav.ts`

## 8. Validation & dependency awareness

- `validateAttach` runs client-side (fast feedback) and server-side (RLS + a `check_relationship()` SQL function invoked from the service).
- Delete flows always call `getUsage` first; `DependencyDialog` renders results and requires confirmation when count > 0.

## 9. Constraints

- No UI redesign; every new surface uses existing tokens/components.
- No direct table writes from components — everything through `relationships.ts`.
- No AI, no live graph viz, no public exposure of the graph.

## Technical notes

- `entity_relationships` uses `text` for `from_type`/`to_type` guarded by a CHECK constraint listing allowed values; keeps future entities cheap.
- Hydration of related summaries is done in the service via per-type batched selects (`in ('id1','id2',...)`) then merged, avoiding N+1.
- `getEntityGraph` is depth-limited (default 1, max 2) to keep queries bounded.
- Cache invalidation: attach/detach invalidates `["relationships", fromType, fromId]` and `["relationships", toType, toId]`, plus the affected list keys (`["admin","projects"]`, etc.).
- All new tables ship with GRANTs (`SELECT` to anon+authenticated where reads are public; writes gated by admin policies).
