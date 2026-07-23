import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils/slug";
import type {
  ContentStatus,
  UnitTypeInsert,
  UnitTypeRow,
  UnitTypeUpdate,
} from "@/types/content";

export async function listUnitTypes(): Promise<UnitTypeRow[]> {
  const { data, error } = await supabase
    .from("unit_types")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getUnitType(id: string): Promise<UnitTypeRow | null> {
  const { data, error } = await supabase.from("unit_types").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase.from("unit_types").select("id", { count: "exact", head: true }).eq("slug", slug);
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

export async function createUnitType(input: UnitTypeInsert): Promise<UnitTypeRow> {
  const slug = await ensureUniqueSlug(input.slug || slugify(input.name));
  const { data, error } = await supabase
    .from("unit_types")
    .insert({ ...input, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateUnitType(id: string, patch: UnitTypeUpdate): Promise<UnitTypeRow> {
  const { data, error } = await supabase
    .from("unit_types")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUnitType(id: string): Promise<void> {
  const { error } = await supabase.from("unit_types").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("unit_types").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("unit_types").delete().in("id", ids);
  if (error) throw error;
}

export async function getUsageCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("entity_relationships")
    .select("to_id")
    .eq("to_type", "unit_type");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.to_id, (counts.get(r.to_id) ?? 0) + 1);
  return counts;
}
