import { supabase } from "@/integrations/supabase/client";

export type EntityType = "place" | "builder" | "project" | "blog" | "review" | "document" | "seo";

export interface MediaAsset {
  id: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  folder: string;
  alt: string;
  title: string;
  caption: string;
  description: string;
  credit: string;
  photographer: string;
  license: string;
  copyright: string;
  tags: string[];
  featured: boolean;
  archived: boolean;
  uploadedBy: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUsage {
  id: string;
  mediaId: string;
  entityType: EntityType;
  entityId: string;
  field: string;
  sortOrder: number;
}

// Legacy entity_* types kept for existing public read paths.
export interface EntityImage {
  id: string;
  storagePath: string;
  alt: string;
  sortOrder: number;
}
export interface EntityDocument {
  id: string;
  title: string;
  url: string;
  kind: string;
  sortOrder: number;
}
export interface EntityScore {
  id: string;
  label: string;
  score: number;
  scale: number;
  sortOrder: number;
}

export const BUCKET = "entity-media";

export function getPublicUrl(storagePath: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

type AssetRow = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  folder: string;
  alt: string;
  title: string;
  caption: string;
  description: string;
  credit: string;
  photographer: string;
  license: string;
  copyright: string;
  tags: string[];
  featured: boolean;
  archived: boolean;
  uploaded_by: string | null;
  usage_count?: number | null;
  created_at: string;
  updated_at: string;
};

export function mapAsset(r: AssetRow): MediaAsset {
  return {
    id: r.id,
    storagePath: r.storage_path,
    fileName: r.file_name,
    mimeType: r.mime_type,
    fileSize: Number(r.file_size ?? 0),
    width: r.width,
    height: r.height,
    folder: r.folder,
    alt: r.alt,
    title: r.title,
    caption: r.caption,
    description: r.description,
    credit: r.credit,
    photographer: r.photographer,
    license: r.license,
    copyright: r.copyright,
    tags: r.tags ?? [],
    featured: r.featured,
    archived: r.archived,
    uploadedBy: r.uploaded_by,
    usageCount: Number(r.usage_count ?? 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface MediaFilters {
  search?: string;
  folder?: string;
  mimeGroup?: "image" | "video" | "document" | "all";
  tag?: string;
  entityType?: EntityType;
  entityId?: string;
  unusedOnly?: boolean;
  largeOnly?: boolean; // > 2MB
  featuredOnly?: boolean;
  archivedOnly?: boolean;
  recentOnly?: boolean; // last 7 days
  page?: number;
  pageSize?: number;
}

export async function listAssets(
  filters: MediaFilters = {},
): Promise<{ data: MediaAsset[]; count: number }> {
  const pageSize = filters.pageSize ?? 48;
  const page = filters.page ?? 0;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("media_assets_with_usage" as never)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.folder && filters.folder !== "all") q = q.eq("folder", filters.folder);
  if (filters.featuredOnly) q = q.eq("featured", true);
  q = q.eq("archived", filters.archivedOnly ? true : false);
  if (filters.largeOnly) q = q.gt("file_size", 2 * 1024 * 1024);
  if (filters.recentOnly) {
    const since = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    q = q.gte("created_at", since);
  }
  if (filters.mimeGroup && filters.mimeGroup !== "all") {
    if (filters.mimeGroup === "image") q = q.like("mime_type", "image/%");
    else if (filters.mimeGroup === "video") q = q.like("mime_type", "video/%");
    else if (filters.mimeGroup === "document") q = q.like("mime_type", "application/%");
  }
  if (filters.tag) q = q.contains("tags", [filters.tag]);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    q = q.or(
      `file_name.ilike.%${s}%,alt.ilike.%${s}%,description.ilike.%${s}%,title.ilike.%${s}%`,
    );
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  let rows = (data ?? []).map((r) => mapAsset(r as AssetRow));
  if (filters.unusedOnly) rows = rows.filter((r) => r.usageCount === 0);
  return { data: rows, count: count ?? rows.length };
}

export async function getAsset(id: string): Promise<MediaAsset | null> {
  const { data, error } = await supabase
    .from("media_assets_with_usage" as never)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAsset(data as AssetRow) : null;
}

export async function listUsages(mediaId: string): Promise<MediaUsage[]> {
  const { data, error } = await supabase
    .from("media_usages")
    .select("*")
    .eq("media_id", mediaId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    mediaId: r.media_id,
    entityType: r.entity_type as EntityType,
    entityId: r.entity_id,
    field: r.field,
    sortOrder: r.sort_order,
  }));
}

export async function listUsagesForEntity(
  entityType: EntityType,
  entityId: string,
  field?: string,
): Promise<(MediaUsage & { asset: MediaAsset })[]> {
  let q = supabase
    .from("media_usages")
    .select("*, asset:media_assets(*)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (field) q = q.eq("field", field);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => {
    const a = r.asset as AssetRow;
    return {
      id: r.id,
      mediaId: r.media_id,
      entityType: r.entity_type as EntityType,
      entityId: r.entity_id,
      field: r.field,
      sortOrder: r.sort_order,
      asset: mapAsset(a),
    };
  });
}

// Legacy readers, kept for public routes.
export async function listEntityImages(
  entityType: EntityType,
  entityId: string,
): Promise<EntityImage[]> {
  const { data, error } = await supabase
    .from("entity_images")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    storagePath: r.storage_path,
    alt: r.alt,
    sortOrder: r.sort_order,
  }));
}

export async function listEntityDocuments(
  entityType: EntityType,
  entityId: string,
): Promise<EntityDocument[]> {
  const { data, error } = await supabase
    .from("entity_documents")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    kind: r.kind,
    sortOrder: r.sort_order,
  }));
}

export async function listEntityScores(
  entityType: EntityType,
  entityId: string,
): Promise<EntityScore[]> {
  const { data, error } = await supabase
    .from("entity_scores")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    score: Number(r.score),
    scale: Number(r.scale),
    sortOrder: r.sort_order,
  }));
}
