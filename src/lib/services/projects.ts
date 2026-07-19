import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";

type Row = {
  id: string;
  slug: string;
  name: string;
  builder_id: string | null;
  place_id: string | null;
  status: Project["status"];
  summary: string;
  metrics: Project["metrics"];
  suitable_for: string[];
  less_suitable_for: string[];
  strengths: string[];
  risks: string[];
  legal: string[];
  progress: string[];
  featured: boolean;
};

function mapProject(row: Row): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    builderId: row.builder_id ?? "",
    placeId: row.place_id ?? "",
    status: row.status,
    summary: row.summary,
    metrics: row.metrics,
    suitableFor: row.suitable_for ?? [],
    lessSuitableFor: row.less_suitable_for ?? [],
    strengths: row.strengths ?? [],
    risks: row.risks ?? [],
    legal: row.legal ?? [],
    progress: row.progress ?? [],
  };
}

export async function listProjects(opts?: {
  featuredOnly?: boolean;
  placeId?: string;
  builderId?: string;
}): Promise<Project[]> {
  let q = supabase.from("projects").select("*").order("name");
  if (opts?.featuredOnly) q = q.eq("featured", true);
  if (opts?.placeId) q = q.eq("place_id", opts.placeId);
  if (opts?.builderId) q = q.eq("builder_id", opts.builderId);
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Row[]).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? mapProject(data as unknown as Row) : null;
}
