
# BUILD-013 — Enterprise Media Library

Extends NHOS with a centralized Digital Asset Management module. Reuses the existing `entity-media` Supabase Storage bucket, admin shell, design system, React Query architecture, and service/repository pattern. No public UI changes.

## Scope of this build

In scope:
- Central `media_assets` table (single source of truth) + `media_usages` table (many-to-many entity linkage) + logical folders (string field, virtual — no physical moves in Storage).
- Service layer + typed React Query hooks; no component talks to Storage directly.
- `/admin/media` Media Library page: upload (drag/drop + picker + queue + progress + retry/cancel), grid/list toggle, search, filters, details panel, bulk actions.
- Reusable `<MediaPicker>` component (modal) — select existing or upload new; returns asset(s).
- Wire Place / Builder / Project editors' image (hero + gallery) fields to `MediaPicker`; back them by `media_usages` rows (keeping the existing `entity_images` table populated for read-side compatibility during transition, mirroring on link/unlink).
- Replace-asset flow (upload new file → replace `storage_path` on same `media_assets.id` → all references update automatically).
- Usage counter + deletion guard (warn if in use).
- Metadata edit: alt, title, caption, description, credit, photographer, license, copyright, tags[].

Explicitly NOT in scope (per brief): AI generation/enhancement, image editing, video processing, CDN migration, version history, thumbnail server-side generation (architecture-ready only), external storage, virtualized grid infra beyond lazy-loading + pagination.

## Data model

```text
media_assets
  id uuid pk
  storage_path text unique
  file_name text
  mime_type text
  file_size bigint
  width int null, height int null
  folder text default 'uncategorized'   -- virtual folder
  alt text, title text, caption text, description text
  credit text, photographer text, license text, copyright text
  tags text[] default '{}'
  featured bool default false
  archived bool default false
  uploaded_by uuid null (auth.users)
  created_at, updated_at

media_usages
  id uuid pk
  media_id uuid fk media_assets on delete cascade
  entity_type text check in ('place','builder','project','blog','review','document','seo')
  entity_id uuid
  field text                              -- 'hero' | 'gallery' | 'logo' | 'brochure' | ...
  sort_order int default 0
  created_at
  unique(media_id, entity_type, entity_id, field, sort_order)

view: media_assets_with_usage (adds usage_count)
```

RLS: public SELECT on `media_assets` (public bucket URLs already public); admin-only INSERT/UPDATE/DELETE via `has_role(auth.uid(),'admin')`. `media_usages` same policies. GRANTs for authenticated + service_role; anon SELECT on assets.

## Service & hooks

- `src/lib/services/media.ts` — types + read-side helpers (`listAssets`, `getAsset`, `getPublicUrl`, `resolveUsage`).
- `src/lib/services/media-admin.ts` — upload/replace/delete/updateMetadata/link/unlink/bulk ops. All Storage calls live here.
- `src/hooks/useMedia.ts` — `useMediaAssets(filters)`, `useAsset(id)`, `useUploadMedia()`, `useReplaceMedia()`, `useDeleteMedia()`, `useUpdateMediaMetadata()`, `useLinkMedia()`, `useUnlinkMedia()`, `useBulkMedia*`.

## UI

- `src/routes/admin.media.index.tsx` — Library page:
  - Header + Upload dropzone (queue with per-file progress, cancel, retry).
  - Folder sidebar (virtual list: Places, Builders, Projects, Blog, Documents, SEO, Temporary, Archive, + custom).
  - Filter bar: type, folder, entity, uploaded date, unused, large files (>2MB), featured, recent.
  - Search (filename / tag / alt / description) — debounced.
  - Grid/List toggle. Cards show thumb, name, type, size, dims, usage count, status. Lazy-load thumbs.
  - Details drawer: preview, all metadata (editable), linked entities list, public URL copy, download, replace, delete (blocked if usage_count > 0 unless confirmed).
  - Bulk selection + toolbar: delete, move folder, tag, archive, download.
- `src/routes/admin.media.$id.tsx` — deep link to asset detail (opens drawer state).
- `src/components/admin/media/MediaPicker.tsx` — modal reused by editors; supports `multiple`, `accept`, current selection; embeds library grid + upload.
- `src/components/admin/media/*` — DropZone, UploadQueue, AssetCard, AssetGrid, AssetList, AssetDetails, FiltersBar, FolderSidebar.

## Editor integration

- `PlaceEditor` Hero + Media tabs → replace inline upload UI with `<MediaPicker>` (hero: single; gallery: multi). Selections stored via `media_usages` (`entity_type='place'`, `field='hero'|'gallery'`). Keep populating `entity_images` in parallel so public routes keep rendering unchanged.
- `BuilderEditor` Media + Logo → `MediaPicker` (logo single; gallery multi). Fold Awards/Certifications document uploads into picker with `accept=application/pdf`.
- `ProjectEditor` Gallery + Brochure/Floor Plan tabs → `MediaPicker`. Brochures/plans use `field='brochure'|'floorplan'`.
- Add a lightweight `usePickedMedia(entityType, entityId, field)` helper hook for editors.

## Nav

Enable Media Library in `src/lib/admin/nav.ts` (`disabled: false`), pointing to `/admin/media`.

## Files touched

New:
- migration: `media_assets`, `media_usages`, view, RLS + GRANTs.
- `src/lib/services/media-admin.ts` (rewrite — supersedes current small file), `src/lib/services/media.ts` (extend).
- `src/hooks/useMedia.ts`.
- `src/components/admin/media/{MediaPicker,DropZone,UploadQueue,AssetGrid,AssetList,AssetCard,AssetDetails,FiltersBar,FolderSidebar}.tsx`.
- `src/routes/admin.media.index.tsx`, `src/routes/admin.media.$id.tsx`.

Edited:
- `src/components/admin/PlaceEditor.tsx`, `BuilderEditor.tsx`, `ProjectEditor.tsx` — swap upload controls for `MediaPicker`.
- `src/lib/admin/nav.ts` — enable Media Library.

## Notes / trade-offs

- Folders are a `folder` text column — purely virtual; files stay at `media/<uuid>/<filename>` in Storage regardless of folder changes. Meets brief.
- Replace-asset overwrites the file at the same `storage_path` with `upsert: true` so all consumers get the new bytes without ref changes; updates `file_size`, `mime_type`, `width`, `height`, bumps `updated_at`.
- Image dimensions probed client-side on upload (via `createImageBitmap`) — no server processing.
- Existing `entity_images` stays as a compat read layer this build; a follow-up build can migrate public reads to `media_usages` and drop it.
- Virtualization is deferred; pagination (48/page) + lazy `<img loading="lazy">` covers thousands of assets comfortably. Adding `react-virtuoso` later is a drop-in.
