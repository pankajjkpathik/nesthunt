import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";
import { 
  RiskService, 
  PromiseLedgerService,
  DecisionEntityService,
  DecisionInsightService,
  type EntityRiskRow,
  type PromiseLedgerRow,
  type DecisionEntityRow,
  type DecisionInsightRow
} from "./decision-intelligence";
import { listEntityImages, type EntityImage } from "@/lib/services/media";
import type { ProjectRow } from "./projects-admin";

/**
 * PROJECT INTELLIGENCE V1 FROZEN
 * Project Intelligence V1 is feature-complete. Future changes should be limited to bug fixes, 
 * security fixes, data-integrity fixes and explicitly approved V2 work.
 */

export interface PublicProject {
  project: ProjectRow & {
    builder?: { id: string; name: string; slug: string };
    place?: { id: string; name: string; slug: string };
  };
  risks: EntityRiskRow[];
  promises: PromiseLedgerRow[];
  decisionEntity: DecisionEntityRow | null;
  insights: DecisionInsightRow[];
  media: EntityImage[];
}

export const ProjectPublicService = {
  async getProjectBySlug(slug: string): Promise<PublicProject | null> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        builder:builders(id, name, slug),
        place:places(id, name, slug),
        governance:project_governance!inner(record_classification)
      `)
      .eq("slug", slug)
      .eq("publish_status", "published")
      .eq("project_governance.record_classification", "PRODUCTION")
      .maybeSingle();
      
    if (error) throw error;
    if (!data) return null;
    
    const project = data as unknown as PublicProject["project"];
    
    const decisionEntity = await DecisionEntityService.getByEntity("project", project.id).catch(() => null);
    
    const [risks, promises, insights, media] = await Promise.all([
      RiskService.listByEntity("project", project.id).catch(() => []),
      PromiseLedgerService.listByEntity("project", project.id).catch(() => []),
      decisionEntity ? DecisionInsightService.listByEntity(decisionEntity.id).catch(() => []) : Promise.resolve([]),
      listEntityImages("project", project.id).catch(() => [])
    ]);

    return {
      project,
      risks,
      promises,
      decisionEntity,
      insights,
      media
    };
  },

  async getProjectById(id: string): Promise<PublicProject | null> {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        builder:builders(id, name, slug),
        place:places(id, name, slug),
        governance:project_governance!inner(record_classification)
      `)
      .eq("id", id)
      .eq("publish_status", "published")
      .eq("project_governance.record_classification", "PRODUCTION")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const project = data as unknown as PublicProject["project"];

    const decisionEntity = await DecisionEntityService.getByEntity("project", project.id).catch(() => null);

    const [risks, promises, insights, media] = await Promise.all([
      RiskService.listByEntity("project", project.id).catch(() => []),
      PromiseLedgerService.listByEntity("project", project.id).catch(() => []),
      decisionEntity ? DecisionInsightService.listByEntity(decisionEntity.id).catch(() => []) : Promise.resolve([]),
      listEntityImages("project", project.id).catch(() => [])
    ]);

    return {
      project,
      risks,
      promises,
      decisionEntity,
      insights,
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
    .select("*, governance:project_governance!inner(record_classification)")
    .eq("slug", slug)
    .eq("publish_status", "published")
    .eq("project_governance.record_classification", "PRODUCTION")
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
    .select("name, slug, summary, metrics, status, governance:project_governance!inner(record_classification)")
    .eq("publish_status", "published")
    .eq("project_governance.record_classification", "PRODUCTION")
    .order("name");

  if (error) throw error;
  return data;
}
