import { z } from "zod";
import { 
  adminGetProject, 
  adminUpdateProject,
  type ProjectUpdate 
} from "./projects-admin";
import { 
  RiskService, 
  PromiseLedgerService, 
  DecisionEntityService,
  DecisionScoreService,
  DecisionFactorService,
  DecisionDimensionService
} from "./decision-intelligence";

/**
 * PROJECT ADMIN SERVICE
 * Authoritative source for Project Intelligence CMS integration.
 */

export const ProjectAdminService = {
  /**
   * Updates project and its related intelligence data.
   * Ensures data integrity across generic intelligence tables.
   */
  async updateProjectIntelligence(id: string, patch: ProjectUpdate) {
    // 1. Preserve metrics JSONB integrity
    const existing = await adminGetProject(id);
    if (!existing) throw new Error("Project not found");

    const updatedMetrics = patch.metrics 
      ? { ...existing.metrics, ...patch.metrics }
      : existing.metrics;

    // 2. Perform base project update
    const updated = await adminUpdateProject(id, {
      ...patch,
      metrics: updatedMetrics as any
    });

    // 3. Ensure Decision Entity exists for this project
    await DecisionEntityService.ensure("project", id);

    return updated;
  },

  /**
   * Synchronizes project strengths from legacy array to generic decision_factors.
   * Only used during migration or when legacy data is present.
   */
  async syncLegacyStrengths(id: string, strengths: string[]) {
    if (!strengths?.length) return;
    
    const entity = await DecisionEntityService.ensure("project", id);
    const scores = await DecisionScoreService.listByEntity(entity.id);
    
    // Use first score or create one
    let scoreId = scores[0]?.id;
    if (!scoreId) {
      // Get first available dimension
      const { data: dims } = await (DecisionDimensionService as any).list(true);
      if (dims?.length) {
        const score = await DecisionScoreService.upsert({
          decision_entity_id: entity.id,
          dimension_id: dims[0].id,
          score: 0
        });
        scoreId = score.id;
      }
    }

    if (!scoreId) return;

    // Add strengths that don't exist yet
    const existingFactors = await DecisionFactorService.listByScore(scoreId);
    for (const s of strengths) {
      if (!existingFactors.some(f => f.title === s)) {
        await DecisionFactorService.create({
          decision_score_id: scoreId,
          title: s,
          factor_type: "positive",
          impact: 7,
          display_order: existingFactors.length
        });
      }
    }
  }
};
