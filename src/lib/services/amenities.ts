import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils/slug";
import type {
  AmenityInsert,
  AmenityRow,
  AmenityUpdate,
  ContentStatus,
} from "@/types/content";

export async function listAmenities(): Promise<AmenityRow[]> {
  const { data, error } = await supabase
    .from("amenities")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getAmenity(id: string): Promise<AmenityRow | null> {
  const { data, error } = await supabase.from("amenities").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase.from("amenities").select("id", { count: "exact", head: true }).eq("slug", slug);
  if (exceptId) q = q.neq("id", exceptId);
  const { count, error } = await q;
  if (error) throw error;
  return (count ?? 0) > 0;
}

async function ensureUniqueSlug(base: string, exceptId?: string): Promise<string> {
  let s = base;
  let n = 1;
  while (await slugExists(s, exceptId)) {
    n += 1;
    s = `${base}-${n}`;
  }
  return s;
}

export async function createAmenity(input: AmenityInsert): Promise<AmenityRow> {
  const slug = await ensureUniqueSlug(input.slug || slugify(input.name));
  const { data, error } = await supabase
    .from("amenities")
    .insert({ ...input, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateAmenity(id: string, patch: AmenityUpdate): Promise<AmenityRow> {
  const { data, error } = await supabase
    .from("amenities")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAmenity(id: string): Promise<void> {
  const { error } = await supabase.from("amenities").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("amenities").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("amenities").delete().in("id", ids);
  if (error) throw error;
}

export async function toggleFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase.from("amenities").update({ featured }).eq("id", id);
  if (error) throw error;
}

export async function duplicateAmenity(id: string): Promise<AmenityRow> {
  const src = await getAmenity(id);
  if (!src) throw new Error("Amenity not found");
  const slug = await ensureUniqueSlug(`${src.slug}-copy`);
  const { id: _i, created_at: _c, updated_at: _u, ...rest } = src;
  return createAmenity({ ...rest, slug, name: `${src.name} (Copy)`, status: "draft" });
}

export async function getUsageCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("entity_relationships")
    .select("to_id")
    .eq("to_type", "amenity");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.to_id, (counts.get(r.to_id) ?? 0) + 1);
  return counts;
}
