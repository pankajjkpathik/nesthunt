import { supabase } from "@/integrations/supabase/client";
import type { Builder, DecisionSummary, TimelineEntry } from "@/types";

type Row = {
  id: string;
  slug: string;
  name: string;
  headquarters: string;
  years_active: number;
  summary: string;
  metrics: Builder["metrics"];
  decision: DecisionSummary;
  strengths: string[];
  watch_outs: string[];
  timeline: TimelineEntry[];
  featured: boolean;
};

function mapBuilder(row: Row): Builder {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    headquarters: row.headquarters,
    yearsActive: row.years_active,
    summary: row.summary,
    metrics: row.metrics,
    decision: row.decision,
    strengths: row.strengths ?? [],
    watchOuts: row.watch_outs ?? [],
    timeline: row.timeline ?? [],
  };
}

export async function listBuilders(opts?: { featuredOnly?: boolean }): Promise<Builder[]> {
  let q = supabase.from("builders").select("*").order("name");
  if (opts?.featuredOnly) q = q.eq("featured", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Row[]).map(mapBuilder);
}

export async function getBuilderBySlug(slug: string): Promise<Builder | null> {
  const { data, error } = await supabase.from("builders").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapBuilder(data as unknown as Row) : null;
}
