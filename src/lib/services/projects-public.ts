import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";
import { 
  RiskService, 
  PromiseLedgerService,
  DecisionIntelligenceService
} from "./decision-intelligence";

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
  publish_status: string;
};

/**
 * PROJECT INTELLIGENCE V1 FOUNDATION
 * This service provides public access to published projects and their intelligence data.
 */

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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    // Only return published projects for public consumption
    .eq("publish_status", "published")
    .maybeSingle();
    
  if (error) throw error;
  if (!data) return null;
  
  return mapProject(data as unknown as Row);
}

export async function getProjectIntelligence(projectId: string) {
  const [risks, promises, decisionEntity] = await Promise.all([
    RiskService.listByEntity("project", projectId),
    PromiseLedgerService.listByEntity("project", projectId),
    DecisionIntelligenceService.getEntity("project", projectId)
  ]);

  return {
    risks,
    promises,
    decisionEntity
  };
}

export async function listPublicProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("name, slug, summary, metrics, status")
    .eq("publish_status", "published")
    .order("name");

  if (error) throw error;
  return data;
}
