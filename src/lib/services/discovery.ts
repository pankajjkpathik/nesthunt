import { supabase } from "@/integrations/supabase/client";

/**
 * Discovery (LAUNCH-001A) — read-only finding/navigation layer.
 * No ranking, scoring, recommendations or personalization.
 * Only published entities are requested; RLS remains authoritative.
 */

export interface DiscoveryProject {
  kind: "project";
  id: string;
  slug: string;
  name: string;
  locality: string | null;
  builderName: string | null;
  status: string | null;
  constructionStatus: string | null;
  configuration: string | null;
  startingPrice: number | null;
  reraNumber: string | null;
  imageUrl: string | null;
  propertyType: string | null;
  startingPriceMax: number | null;
  updatedAt: string | null;
}

export interface DiscoveryBuilder {
  kind: "builder";
  id: string;
  slug: string;
  name: string;
  headquarters: string | null;
  city: string | null;
  yearEstablished: number | null;
  logoUrl: string | null;
  builderType: string | null;
  state: string | null;
  updatedAt: string | null;
}

export interface DiscoveryPlace {
  kind: "place";
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  region: string | null;
  localityType: string | null;
  updatedAt: string | null;
}

export type DiscoveryResult = DiscoveryProject | DiscoveryBuilder | DiscoveryPlace;

function readImage(hero: unknown): string | null {
  if (!hero || typeof hero !== "object") return null;
  const h = hero as Record<string, unknown>;
  const candidate = h.url ?? h.image ?? h.imageUrl ?? h.src ?? h.logo;
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function readConfiguration(unitTypes: unknown): string | null {
  if (Array.isArray(unitTypes)) {
    const labels = unitTypes
      .map((u) => {
        if (typeof u === "string") return u;
        if (u && typeof u === "object") {
          const rec = u as Record<string, unknown>;
          const v = rec.name ?? rec.label ?? rec.type ?? rec.configuration;
          return typeof v === "string" ? v : null;
        }
        return null;
      })
      .filter((v): v is string => !!v);
    if (labels.length) return labels.join(", ");
  }
  return null;
}

export const DiscoveryService = {
  async listProjects(): Promise<DiscoveryProject[]> {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,slug,name,status,construction_status,starting_price,max_price,property_type,rera_number,unit_types,hero,updated_at,builder:builders(name),place:places(name,city)",
      )
      .eq("publish_status", "published")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((r) => {
      const row = r as unknown as {
        id: string;
        slug: string;
        name: string;
        status: string | null;
        construction_status: string | null;
        starting_price: number | null;
        max_price: number | null;
        property_type: string | null;
        rera_number: string | null;
        updated_at: string | null;
        unit_types: unknown;
        hero: unknown;
        builder: { name: string } | null;
        place: { name: string; city: string | null } | null;
      };
      return {
        kind: "project" as const,
        id: row.id,
        slug: row.slug,
        name: row.name,
        locality: row.place?.name ?? row.place?.city ?? null,
        builderName: row.builder?.name ?? null,
        status: row.status ?? null,
        constructionStatus: row.construction_status ?? null,
        configuration: readConfiguration(row.unit_types),
        startingPrice: row.starting_price ?? null,
        reraNumber: row.rera_number ?? null,
        imageUrl: readImage(row.hero),
        propertyType: row.property_type || null,
        startingPriceMax: row.max_price ?? null,
        updatedAt: row.updated_at ?? null,
      };
    });
  },

  async listBuilders(): Promise<DiscoveryBuilder[]> {
    const { data, error } = await supabase
      .from("builders")
      .select("id,slug,name,headquarters,city,state,builder_type,year_established,hero,updated_at")
      .eq("status", "published")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      kind: "builder" as const,
      id: r.id,
      slug: r.slug,
      name: r.name,
      headquarters: r.headquarters || null,
      city: r.city || null,
      yearEstablished: r.year_established ?? null,
      logoUrl: readImage(r.hero),
      builderType: r.builder_type || null,
      state: r.state || null,
      updatedAt: r.updated_at ?? null,
    }));
  },

  async listPlaces(): Promise<DiscoveryPlace[]> {
    const { data, error } = await supabase
      .from("places")
      .select("id,slug,name,city,state,region,locality_type,updated_at")
      .eq("status", "published")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      kind: "place" as const,
      id: r.id,
      slug: r.slug,
      name: r.name,
      city: r.city || null,
      state: r.state || null,
      region: r.region || null,
      localityType: r.locality_type || null,
      updatedAt: r.updated_at ?? null,
    }));
  },
};

export function matchesQuery(item: DiscoveryResult, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields: (string | null)[] =
    item.kind === "project"
      ? [item.name, item.locality, item.builderName]
      : item.kind === "builder"
        ? [item.name, item.city, item.headquarters]
        : [item.name, item.city, item.state, item.region];
  return fields.some((f) => !!f && f.toLowerCase().includes(q));
}
