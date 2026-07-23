import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PlaceStatus = "draft" | "review" | "published" | "archived";

export type PlaceRow = Database["public"]["Tables"]["places"]["Row"];
export type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"];
export type PlaceUpdate = Database["public"]["Tables"]["places"]["Update"];

export interface PlaceHero {
  headline?: string;
  subheadline?: string;
  tagline?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
}

export interface PlaceSeo {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface PlaceMetrics {
  population?: string;
  avgPricePerSqft?: string;
  activeProjects?: number;
  verifiedBuilders?: number;
}

export interface CategoryScore {
  label: string;
  score: number; // 0-10
}

export interface PlaceDecision {
  score: number;
  confidence: "Low" | "Medium" | "High";
  verdict: string;
  categoryRatings: CategoryScore[];
}

export const DEFAULT_CATEGORIES: CategoryScore[] = [
  { label: "Infrastructure", score: 8 },
  { label: "Connectivity", score: 8 },
  { label: "Livability", score: 7 },
  { label: "Growth Potential", score: 8 },
  { label: "Legal Clarity", score: 8 },
  { label: "Investment Value", score: 7 },
];

export function computeDecisionScore(cats: CategoryScore[]): number {
  if (!cats.length) return 0;
  const avg = cats.reduce((s, c) => s + (Number(c.score) || 0), 0) / cats.length;
  return Math.round(avg * 10) / 10;
}

export async function adminListPlaces(): Promise<PlaceRow[]> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetPlace(id: string): Promise<PlaceRow | null> {
  const { data, error } = await supabase.from("places").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminCreatePlace(input: PlaceInsert): Promise<PlaceRow> {
  const { data, error } = await supabase.from("places").insert(input).select("*").single();
  if (error) throw error;
  return data;
}

export async function adminUpdatePlace(id: string, patch: PlaceUpdate): Promise<PlaceRow> {
  const { data, error } = await supabase
    .from("places")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function adminDeletePlace(id: string): Promise<void> {
  const { error } = await supabase.from("places").delete().eq("id", id);
  if (error) throw error;
}

export async function adminBulkUpdateStatus(ids: string[], status: PlaceStatus): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("places").update({ status }).in("id", ids);
  if (error) throw error;
}

export async function adminBulkDelete(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("places").delete().in("id", ids);
  if (error) throw error;
}

export async function adminSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase.from("places").select("id", { count: "exact", head: true }).eq("slug", slug);
  if (exceptId) q = q.neq("id", exceptId);
  const { count, error } = await q;
  if (error) throw error;
  return (count ?? 0) > 0;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let n = 1;
  while (await adminSlugExists(candidate)) {
    n += 1;
    candidate = `${baseSlug}-${n}`;
  }
  return candidate;
}

export async function adminDuplicatePlace(id: string): Promise<PlaceRow> {
  const src = await adminGetPlace(id);
  if (!src) throw new Error("Place not found");
  const baseSlug = `${src.slug}-copy`;
  const slug = await ensureUniqueSlug(baseSlug);
  const {
    id: _id,
    created_at: _c,
    updated_at: _u,
    ...rest
  } = src;
  const insert: PlaceInsert = {
    ...rest,
    slug,
    name: `${src.name} (Copy)`,
    status: "draft",
    featured: false,
  };
  return adminCreatePlace(insert);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
