import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BuilderStatus = "draft" | "review" | "published" | "archived";

/** Loose row type — the auto-generated Database types cover the base builders columns.
 *  The enterprise fields added in the latest migration are represented here explicitly. */
export type BuilderRow = Database["public"]["Tables"]["builders"]["Row"] & {
  status?: string;
  verified?: boolean;
  builder_type?: string;
  tagline?: string;
  description?: string;
  country?: string;
  state?: string;
  city?: string;
  year_established?: number | null;
  head_office?: string;
  website?: string;
  email?: string;
  phone?: string;
  pan?: string;
  gst?: string;
  company_registration?: string;
  organization_type?: string;
  employee_count?: string;
  trust_score?: number | null;
  trust_breakdown?: TrustBreakdownEntry[];
  leadership?: LeadershipMember[];
  rera?: ReraEntry[];
  awards?: AwardEntry[];
  certifications?: CertificationEntry[];
  hero?: BuilderHero;
  seo?: BuilderSeo;
};

export type BuilderInsert = Database["public"]["Tables"]["builders"]["Insert"] &
  Partial<Omit<BuilderRow, keyof Database["public"]["Tables"]["builders"]["Insert"]>>;
export type BuilderUpdate = Partial<BuilderRow>;

export interface LeadershipMember {
  id?: string;
  name: string;
  designation: string;
  bio?: string;
  photoUrl?: string;
  linkedIn?: string;
  order?: number;
}

export interface ReraEntry {
  registration: string;
  authority: string;
  registrationDate?: string;
  validity?: string;
  status?: "active" | "expired" | "pending";
  documentUrl?: string;
}

export interface AwardEntry {
  title: string;
  issuer?: string;
  year?: number;
  description?: string;
  imageUrl?: string;
}

export interface CertificationEntry {
  title: string;
  issuer?: string;
  year?: number;
  description?: string;
  imageUrl?: string;
}

export interface TrustBreakdownEntry {
  label: string;
  score: number;
}

export interface BuilderHero {
  headline?: string;
  subheadline?: string;
  tagline?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
  logoUrl?: string;
}

export interface BuilderSeo {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

export const DEFAULT_TRUST_BREAKDOWN: TrustBreakdownEntry[] = [
  { label: "Experience", score: 8 },
  { label: "Delivery Record", score: 8 },
  { label: "RERA Compliance", score: 9 },
  { label: "Financial Stability", score: 7 },
  { label: "Customer Reviews", score: 8 },
  { label: "Transparency", score: 8 },
];

export function computeTrustScore(cats: TrustBreakdownEntry[]): number {
  if (!cats.length) return 0;
  const avg = cats.reduce((s, c) => s + (Number(c.score) || 0), 0) / cats.length;
  return Math.round(avg * 10) / 10;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// -----------------------------
// CRUD
// -----------------------------

export async function adminListBuilders(): Promise<BuilderRow[]> {
  const { data, error } = await supabase
    .from("builders")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BuilderRow[];
}

export async function adminGetBuilder(id: string): Promise<BuilderRow | null> {
  const { data, error } = await supabase
    .from("builders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as BuilderRow | null;
}

export async function adminCreateBuilder(input: BuilderInsert): Promise<BuilderRow> {
  const { data, error } = await supabase
    .from("builders")
    .insert(input as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as BuilderRow;
}

export async function adminUpdateBuilder(id: string, patch: BuilderUpdate): Promise<BuilderRow> {
  const { data, error } = await supabase
    .from("builders")
    .update(patch as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as BuilderRow;
}

export async function adminDeleteBuilder(id: string): Promise<void> {
  const { error } = await supabase.from("builders").delete().eq("id", id);
  if (error) throw error;
}

export async function adminBulkUpdateBuilderStatus(
  ids: string[],
  status: BuilderStatus,
): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase
    .from("builders")
    .update({ status } as never)
    .in("id", ids);
  if (error) throw error;
}

export async function adminBulkVerifyBuilders(ids: string[], verified: boolean): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase
    .from("builders")
    .update({ verified } as never)
    .in("id", ids);
  if (error) throw error;
}

export async function adminBulkDeleteBuilders(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("builders").delete().in("id", ids);
  if (error) throw error;
}

export async function adminBuilderSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = supabase.from("builders").select("id", { count: "exact", head: true }).eq("slug", slug);
  if (exceptId) q = q.neq("id", exceptId);
  const { count, error } = await q;
  if (error) throw error;
  return (count ?? 0) > 0;
}

async function ensureUniqueBuilderSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let n = 1;
  while (await adminBuilderSlugExists(candidate)) {
    n += 1;
    candidate = `${baseSlug}-${n}`;
  }
  return candidate;
}

export async function adminDuplicateBuilder(id: string): Promise<BuilderRow> {
  const src = await adminGetBuilder(id);
  if (!src) throw new Error("Builder not found");
  const baseSlug = `${src.slug}-copy`;
  const slug = await ensureUniqueBuilderSlug(baseSlug);
  const {
    id: _id,
    created_at: _c,
    updated_at: _u,
    ...rest
  } = src;
  const insert: BuilderInsert = {
    ...(rest as BuilderInsert),
    slug,
    name: `${src.name} (Copy)`,
    status: "draft",
    featured: false,
    verified: false,
  };
  return adminCreateBuilder(insert);
}

// -----------------------------
// Builder ↔ Place relationships
// -----------------------------

export async function listBuilderPlaces(builderId: string): Promise<string[]> {
  const { data, error } = await (supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (col: string, val: string) => Promise<{ data: { place_id: string }[] | null; error: unknown }>;
      };
    };
  })
    .from("builder_places")
    .select("place_id")
    .eq("builder_id", builderId);
  if (error) throw error as Error;
  return (data ?? []).map((r) => r.place_id);
}

export async function attachBuilderPlace(builderId: string, placeId: string): Promise<void> {
  const { error } = await (supabase as unknown as {
    from: (t: string) => {
      insert: (v: unknown) => Promise<{ error: unknown }>;
    };
  })
    .from("builder_places")
    .insert({ builder_id: builderId, place_id: placeId });
  if (error) throw error as Error;
}

export async function detachBuilderPlace(builderId: string, placeId: string): Promise<void> {
  const { error } = await (supabase as unknown as {
    from: (t: string) => {
      delete: () => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>;
        };
      };
    };
  })
    .from("builder_places")
    .delete()
    .eq("builder_id", builderId)
    .eq("place_id", placeId);
  if (error) throw error as Error;
}

// -----------------------------
// Builder projects (readonly)
// -----------------------------

export interface BuilderProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  place_id: string | null;
}

export async function listBuilderProjects(builderId: string): Promise<BuilderProjectSummary[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,slug,status,place_id")
    .eq("builder_id", builderId)
    .order("name");
  if (error) throw error;
  return (data ?? []) as BuilderProjectSummary[];
}
