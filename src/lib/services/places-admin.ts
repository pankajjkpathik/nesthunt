import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type PlaceStatus = "draft" | "review" | "published";

export type PlaceRow = Database["public"]["Tables"]["places"]["Row"];
export type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"];
export type PlaceUpdate = Database["public"]["Tables"]["places"]["Update"];

export interface PlaceHero {
  headline?: string;
  subheadline?: string;
  tagline?: string;
  heroImageUrl?: string;
}

export interface PlaceSeo {
  title?: string;
  description?: string;
  keywords?: string;
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
  return Math.round(avg * 10) / 10; // one decimal, on /10 scale
}

/** List all places (draft, review, published) for admin. */
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

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
