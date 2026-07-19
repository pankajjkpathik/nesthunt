import { supabase } from "@/integrations/supabase/client";
import type { Place, DecisionSummary } from "@/types";

type Row = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  executive_summary: string;
  highlights: string[];
  metrics: Place["metrics"];
  decision: DecisionSummary;
  opportunities: string[];
  risks: string[];
  featured: boolean;
};

function mapPlace(row: Row): Place {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region,
    summary: row.summary,
    executiveSummary: row.executive_summary,
    highlights: row.highlights ?? [],
    metrics: row.metrics,
    decision: row.decision,
    opportunities: row.opportunities ?? [],
    risks: row.risks ?? [],
  };
}

export async function listPlaces(opts?: { featuredOnly?: boolean }): Promise<Place[]> {
  let q = supabase.from("places").select("*").order("name");
  if (opts?.featuredOnly) q = q.eq("featured", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Row[]).map(mapPlace);
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const { data, error } = await supabase.from("places").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapPlace(data as unknown as Row) : null;
}
