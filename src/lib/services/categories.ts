import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils/slug";
import type {
  CategoryInsert,
  CategoryNode,
  CategoryRow,
  CategoryUpdate,
  ContentStatus,
} from "@/types/content";

export async function listCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCategory(id: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase.from("categories").select("id", { count: "exact", head: true }).eq("slug", slug);
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

export async function createCategory(input: CategoryInsert): Promise<CategoryRow> {
  const slug = await ensureUniqueSlug(input.slug || slugify(input.name));
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...input, slug })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, patch: CategoryUpdate): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateStatus(ids: string[], status: ContentStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("categories").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("categories").delete().in("id", ids);
  if (error) throw error;
}

export async function duplicateCategory(id: string): Promise<CategoryRow> {
  const src = await getCategory(id);
  if (!src) throw new Error("Category not found");
  const slug = await ensureUniqueSlug(`${src.slug}-copy`);
  const { id: _i, created_at: _c, updated_at: _u, ...rest } = src;
  return createCategory({ ...rest, slug, name: `${src.name} (Copy)`, status: "draft" });
}

export function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: CategoryNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function getUsageCounts(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("entity_relationships")
    .select("to_id")
    .eq("to_type", "category");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of data ?? []) counts.set(r.to_id, (counts.get(r.to_id) ?? 0) + 1);
  return counts;
}
