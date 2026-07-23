import { supabase } from "@/integrations/supabase/client";
import {
  BUCKET,
  getPublicUrl,
  mapAsset,
  type EntityType,
  type MediaAsset,
} from "@/lib/services/media";

export { getPublicUrl } from "@/lib/services/media";

export const FOLDERS = [
  "uncategorized",
  "places",
  "builders",
  "projects",
  "blog",
  "documents",
  "seo",
  "temporary",
  "archive",
] as const;
export type Folder = (typeof FOLDERS)[number] | string;

export const SUPPORTED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export interface UploadInput {
  file: File;
  folder?: Folder;
  alt?: string;
  title?: string;
  tags?: string[];
}

async function probeDimensions(
  file: File,
): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return { width: null, height: null };
  }
  try {
    const bmp = await createImageBitmap(file);
    const dims = { width: bmp.width, height: bmp.height };
    bmp.close?.();
    return dims;
  } catch {
    return { width: null, height: null };
  }
}

export async function uploadAsset(input: UploadInput): Promise<MediaAsset> {
  const { file } = input;
  const folder = input.folder ?? "uncategorized";
  const ext = file.name.split(".").pop() || "bin";
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `media/${id}/${safeName || `file.${ext}`}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (upErr) throw upErr;

  const dims = await probeDimensions(file);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      width: dims.width,
      height: dims.height,
      folder,
      alt: input.alt ?? "",
      title: input.title ?? "",
      tags: input.tags ?? [],
      uploaded_by: user?.id ?? null,
    })
    .select("*")
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }
  return mapAsset({ ...(data as never), usage_count: 0 });
}

export async function replaceAsset(id: string, file: File): Promise<MediaAsset> {
  const { data: existing, error: fetchErr } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fetchErr) throw fetchErr;
  const storagePath = existing.storage_path;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { cacheControl: "3600", upsert: true, contentType: file.type });
  if (upErr) throw upErr;

  const dims = await probeDimensions(file);
  const { data, error } = await supabase
    .from("media_assets")
    .update({
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      width: dims.width,
      height: dims.height,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapAsset({ ...(data as never), usage_count: 0 });
}

export interface MetadataPatch {
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  credit?: string;
  photographer?: string;
  license?: string;
  copyright?: string;
  tags?: string[];
  folder?: string;
  featured?: boolean;
  archived?: boolean;
}

export async function updateAssetMetadata(id: string, patch: MetadataPatch): Promise<MediaAsset> {
  const { data, error } = await supabase
    .from("media_assets")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapAsset({ ...(data as never), usage_count: 0 });
}

export async function deleteAsset(id: string, force = false): Promise<void> {
  if (!force) {
    const { count } = await supabase
      .from("media_usages")
      .select("id", { count: "exact", head: true })
      .eq("media_id", id);
    if ((count ?? 0) > 0) {
      throw new Error(`Asset is used in ${count} place(s). Pass force=true to delete anyway.`);
    }
  }
  const { data: existing } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (existing?.storage_path) {
    await supabase.storage.from(BUCKET).remove([existing.storage_path]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkDeleteAssets(ids: string[], force = false): Promise<void> {
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    await deleteAsset(id, force);
  }
}

export async function bulkUpdateFolder(ids: string[], folder: string): Promise<void> {
  const { error } = await supabase.from("media_assets").update({ folder }).in("id", ids);
  if (error) throw error;
}

export async function bulkArchive(ids: string[], archived: boolean): Promise<void> {
  const { error } = await supabase.from("media_assets").update({ archived }).in("id", ids);
  if (error) throw error;
}

export async function bulkAddTags(ids: string[], newTags: string[]): Promise<void> {
  // Merge tags per row (small ops set, simple loop).
  const { data, error } = await supabase.from("media_assets").select("id, tags").in("id", ids);
  if (error) throw error;
  for (const row of data ?? []) {
    const merged = Array.from(new Set([...(row.tags ?? []), ...newTags]));
    // eslint-disable-next-line no-await-in-loop
    await supabase.from("media_assets").update({ tags: merged }).eq("id", row.id);
  }
}

/* Linking (media_usages) */

export interface LinkInput {
  mediaId: string;
  entityType: EntityType;
  entityId: string;
  field?: string;
  sortOrder?: number;
}

export async function linkMedia(input: LinkInput): Promise<void> {
  const { error } = await supabase.from("media_usages").insert({
    media_id: input.mediaId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    field: input.field ?? "gallery",
    sort_order: input.sortOrder ?? 0,
  });
  if (error) throw error;
  // Mirror into entity_images for legacy public reads (image types only).
  if (
    (input.entityType === "place" ||
      input.entityType === "builder" ||
      input.entityType === "project") &&
    (input.field ?? "gallery") !== "brochure" &&
    (input.field ?? "gallery") !== "floorplan"
  ) {
    const { data: asset } = await supabase
      .from("media_assets")
      .select("storage_path, alt, mime_type")
      .eq("id", input.mediaId)
      .single();
    if (asset && asset.mime_type?.startsWith("image/")) {
      await supabase
        .from("entity_images")
        .insert({
          entity_type: input.entityType,
          entity_id: input.entityId,
          storage_path: asset.storage_path,
          alt: asset.alt ?? "",
          sort_order: input.sortOrder ?? 0,
        })
        .then(() => undefined, () => undefined);
    }
  }
}

export async function unlinkMedia(usageId: string): Promise<void> {
  const { data: usage } = await supabase
    .from("media_usages")
    .select("media_id, entity_type, entity_id")
    .eq("id", usageId)
    .single();
  const { error } = await supabase.from("media_usages").delete().eq("id", usageId);
  if (error) throw error;
  if (usage) {
    const { data: asset } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", usage.media_id)
      .single();
    if (asset) {
      await supabase
        .from("entity_images")
        .delete()
        .eq("entity_type", usage.entity_type)
        .eq("entity_id", usage.entity_id)
        .eq("storage_path", asset.storage_path);
    }
  }
}

export async function unlinkAllForEntity(
  entityType: EntityType,
  entityId: string,
  field?: string,
): Promise<void> {
  let q = supabase
    .from("media_usages")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);
  if (field) q = q.eq("field", field);
  const { error } = await q;
  if (error) throw error;
}

/* Legacy shims — old PlaceEditor callers */
export async function uploadMedia(
  file: File,
  entityType: EntityType,
  entityId: string,
): Promise<string> {
  const asset = await uploadAsset({ file, folder: `${entityType}s` });
  await linkMedia({ mediaId: asset.id, entityType, entityId, field: "gallery" });
  return asset.storagePath;
}

export async function addEntityImage(
  _entityType: EntityType,
  _entityId: string,
  _storagePath: string,
  _alt = "",
  _sortOrder = 0,
) {
  // Legacy no-op — linking is now handled by uploadMedia() via linkMedia().
  return null;
}

export async function removeEntityImage(id: string, storagePath?: string) {
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => undefined);
  }
  const { error } = await supabase.from("entity_images").delete().eq("id", id);
  if (error) throw error;
}
