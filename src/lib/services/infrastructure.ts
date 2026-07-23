import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils/slug";
import type {
  ContentStatus,
  InfrastructureInsert,
  InfrastructureLinkRow,
  InfrastructureRow,
  InfrastructureUpdate,
} from "@/types/content";

export async function listInfrastructure(): Promise<InfrastructureRow[]> {
  const { data, error } = await supabase
    .from("infrastructure_items")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInfrastructure(id: string): Promise<InfrastructureRow | null> {
  const { data, error } = await supabase
    .from("infrastructure_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase
    .from("infrastructure_items")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);
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

export async function createInfrastructure(
  input: InfrastructureInsert,
): Promise<InfrastructureRow> {
  const slug = await ensureUniqueSlug(input.slug || slugify(input.name));
  const { data, error } = await supabase
    .from("infrastructure_items")
    .insert({ ...input, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateInfrastructure(
  id: string,
  patch: InfrastructureUpdate,
): Promise<InfrastructureRow> {
  const { data, error } = await supabase
    .from("infrastructure_items")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInfrastructure(id: string): Promise<void> {
  const { error } = await supabase.from("infrastructure_items").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase
    .from("infrastructure_items")
    .update({ status })
    .in("id", ids);
  if (error) throw error;
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("infrastructure_items").delete().in("id", ids);
  if (error) throw error;
}

/* ---------- Links (infrastructure ↔ place/project) ---------- */

export async function listLinksForEntity(
  entityType: "place" | "project",
  entityId: string,
): Promise<Array<InfrastructureLinkRow & { infrastructure: InfrastructureRow | null }>> {
  const { data, error } = await supabase
    .from("infrastructure_links")
    .select("*, infrastructure:infrastructure_items(*)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Array<
    InfrastructureLinkRow & { infrastructure: InfrastructureRow | null }
  >;
}

export async function listLinksForInfrastructure(
  infrastructureId: string,
): Promise<InfrastructureLinkRow[]> {
  const { data, error } = await supabase
    .from("infrastructure_links")
    .select("*")
    .eq("infrastructure_id", infrastructureId);
  if (error) throw error;
  return data ?? [];
}

export async function attachInfrastructure(input: {
  infrastructureId: string;
  entityType: "place" | "project";
  entityId: string;
  distanceKm?: number | null;
  notes?: string | null;
}): Promise<InfrastructureLinkRow> {
  const { data, error } = await supabase
    .from("infrastructure_links")
    .upsert(
      {
        infrastructure_id: input.infrastructureId,
        entity_type: input.entityType,
        entity_id: input.entityId,
        distance_km: input.distanceKm ?? null,
        notes: input.notes ?? null,
      },
      { onConflict: "infrastructure_id,entity_type,entity_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateLink(
  id: string,
  patch: { distance_km?: number | null; notes?: string | null; sort_order?: number },
): Promise<void> {
  const { error } = await supabase.from("infrastructure_links").update(patch).eq("id", id);
  if (error) throw error;
}

export async function detachInfrastructure(linkId: string): Promise<void> {
  const { error } = await supabase.from("infrastructure_links").delete().eq("id", linkId);
  if (error) throw error;
}

export async function getUsageCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("infrastructure_links")
    .select("infrastructure_id");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of data ?? [])
    counts.set(r.infrastructure_id, (counts.get(r.infrastructure_id) ?? 0) + 1);
  return counts;
}
