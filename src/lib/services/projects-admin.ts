import { supabase } from "@/integrations/supabase/client";

export type ProjectPublishStatus = "draft" | "review" | "published" | "archived";
export type ProjectStatus = "planning" | "under-construction" | "ready";
export type ConstructionStatus =
  | "not-started"
  | "excavation"
  | "foundation"
  | "structure"
  | "finishing"
  | "ready"
  | "delivered";

export interface UnitType {
  id?: string;
  type: string;
  sizeRange?: string;
  priceRange?: string;
  availability?: string;
  floorPlanUrl?: string;
  facing?: string;
  order?: number;
}

export interface NearbyEntry {
  id?: string;
  category: string;
  name: string;
  distance?: string;
  description?: string;
}

export interface ProjectRera {
  number?: string;
  registrationDate?: string;
  validUntil?: string;
  authority?: string;
  certificateUrl?: string;
}

export interface ProjectInvestment {
  rentalYield?: string;
  appreciation?: string;
  demandIndex?: string;
  liquidityScore?: string;
  rating?: string;
}

export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface ProjectHero {
  headline?: string;
  subheadline?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
  masterPlanUrl?: string;
  brochureUrl?: string;
  gallery?: GalleryImage[];
  floorPlans?: GalleryImage[];
}

export interface ProjectSeo {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  structuredData?: string;
}

export interface ProjectMetrics {
  unitTypes?: string;
  priceRange?: string;
  possessionYear?: number;
  totalUnits?: number;
}

export interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  builder_id: string | null;
  place_id: string | null;
  status: ProjectStatus;
  publish_status: ProjectPublishStatus;
  verified: boolean;
  featured: boolean;
  summary: string;
  tagline: string | null;
  short_description: string | null;
  executive_summary: string | null;
  property_type: string | null;
  construction_status: ConstructionStatus | null;
  completion_percentage: number | null;
  starting_price: number | null;
  max_price: number | null;
  price_per_sqft: number | null;
  booking_amount: number | null;
  maintenance_charges: string | null;
  launch_date: string | null;
  completion_date: string | null;
  possession_date: string | null;
  rera_number: string | null;
  rera: ProjectRera;
  unit_types: UnitType[];
  amenities: string[];
  nearby: NearbyEntry[];
  investment: ProjectInvestment;
  hero: ProjectHero;
  seo: ProjectSeo;
  metrics: ProjectMetrics;
  suitable_for: string[];
  less_suitable_for: string[];
  strengths: string[];
  risks: string[];
  legal: string[];
  progress: string[];
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Partial<ProjectRow> & { slug: string; name: string };
export type ProjectUpdate = Partial<ProjectRow>;

const TABLE = "projects" as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const AMENITY_PRESETS: string[] = [
  "Clubhouse",
  "Swimming Pool",
  "Gym",
  "Park",
  "Children's Play Area",
  "Security",
  "EV Charging",
  "Power Backup",
  "Rainwater Harvesting",
  "Landscaped Gardens",
  "Jogging Track",
  "Indoor Games",
  "Amphitheatre",
  "Concierge",
];

export const PROPERTY_TYPES: string[] = [
  "Apartment",
  "Villa",
  "Plot",
  "Townhouse",
  "Penthouse",
  "Commercial",
  "Retail",
  "Office",
  "Mixed-Use",
];

export const CONSTRUCTION_STATUSES: { value: ConstructionStatus; label: string }[] = [
  { value: "not-started", label: "Not started" },
  { value: "excavation", label: "Excavation" },
  { value: "foundation", label: "Foundation" },
  { value: "structure", label: "Structure" },
  { value: "finishing", label: "Finishing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function isValidReraNumber(v: string): boolean {
  if (!v) return true;
  return /^[A-Z0-9/\-]{6,}$/i.test(v.trim());
}

// -----------------------------
// CRUD
// -----------------------------

export async function adminListProjects(): Promise<ProjectRow[]> {
  const { data, error } = await db
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function adminGetProject(id: string): Promise<ProjectRow | null> {
  const { data, error } = await db.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as ProjectRow | null;
}

export async function adminCreateProject(input: ProjectInsert): Promise<ProjectRow> {
  const { data, error } = await db.from(TABLE).insert(input).select("*").single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function adminUpdateProject(id: string, patch: ProjectUpdate): Promise<ProjectRow> {
  const { data, error } = await db.from(TABLE).update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as ProjectRow;
}

export async function adminDeleteProject(id: string): Promise<void> {
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function adminBulkUpdateProjectPublishStatus(
  ids: string[],
  publish_status: ProjectPublishStatus,
): Promise<void> {
  if (!ids.length) return;
  const { error } = await db.from(TABLE).update({ publish_status }).in("id", ids);
  if (error) throw error;
}

export async function adminBulkDeleteProjects(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await db.from(TABLE).delete().in("id", ids);
  if (error) throw error;
}

export async function adminProjectSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  let q = db.from(TABLE).select("id", { count: "exact", head: true }).eq("slug", slug);
  if (exceptId) q = q.neq("id", exceptId);
  const { count, error } = await q;
  if (error) throw error;
  return (count ?? 0) > 0;
}

async function ensureUniqueProjectSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 1;
  while (await adminProjectSlugExists(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export async function adminDuplicateProject(id: string): Promise<ProjectRow> {
  const src = await adminGetProject(id);
  if (!src) throw new Error("Project not found");
  const base = `${src.slug}-copy`;
  const slug = await ensureUniqueProjectSlug(base);
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = src;
  const insert: ProjectInsert = {
    ...(rest as ProjectInsert),
    slug,
    name: `${src.name} (Copy)`,
    publish_status: "draft",
    featured: false,
    verified: false,
  };
  return adminCreateProject(insert);
}

export async function adminBulkDuplicateProjects(ids: string[]): Promise<void> {
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    await adminDuplicateProject(id);
  }
}
