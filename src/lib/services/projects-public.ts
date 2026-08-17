import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";
import { 
  RiskService, 
  PromiseLedgerService,
  DecisionEntityService,
  type EntityRiskRow,
  type PromiseLedgerRow,
  type DecisionEntityRow
} from "./decision-intelligence";
import { listEntityImages, type EntityImage } from "@/lib/services/media";
import type { ProjectRow } from "./projects-admin";

/**
 * PROJECT INTELLIGENCE V1
 * This service provides public access to published projects and their intelligence data.
 */

export interface PublicProject {
  project: ProjectRow & {
    builder?: { id: string; name: string; slug: string };
    place?: { id: string; name: string; slug: string };
  };
  risks: EntityRiskRow[];
  promises: PromiseLedgerRow[];
  decisionEntity: DecisionEntityRow | null;
  media: EntityImage[];
}

export const ProjectPublicService = {
  async getProjectBySlug(slug: string): Promise<PublicProject | null> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        builder:builders(id, name, slug),
        place:places(id, name, slug)
      `)
      .eq("slug", slug)
      .eq("publish_status", "published")
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return null;
    
    const project = data as unknown as PublicProject["project"];
    
    const [risks, promises, decisionEntity, media] = await Promise.all([
      RiskService.listByEntity("project", project.id).catch(() => []),
      PromiseLedgerService.listByEntity("project", project.id).catch(() => []),
      DecisionEntityService.getByEntity("project", project.id).catch(() => null),
      listEntityImages("project", project.id).catch(() => [])
    ]);

    return {
      project,
      risks,
      promises,
      decisionEntity,
      media
    };
  }
};

/**
 * @deprecated Use ProjectPublicService.getProjectBySlug
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .maybeSingle();
    
  if (error) throw error;
  if (!data) return null;
  
  // Minimal mapping for backward compatibility if needed
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    builderId: data.builder_id ?? "",
    placeId: data.place_id ?? "",
    status: data.status as Project["status"],
    summary: data.summary,
    metrics: data.metrics as unknown as Project["metrics"],
    suitableFor: data.suitable_for ?? [],
    lessSuitableFor: data.less_suitable_for ?? [],
    strengths: data.strengths ?? [],
    risks: data.risks ?? [],
    legal: data.legal ?? [],
    progress: data.progress ?? [],
  };
}

/**
 * @deprecated
 */
export async function getProjectIntelligence(projectId: string) {
  const [risks, promises, decisionEntity] = await Promise.all([
    RiskService.listByEntity("project", projectId),
    PromiseLedgerService.listByEntity("project", projectId),
    DecisionEntityService.getByEntity("project", projectId)
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
