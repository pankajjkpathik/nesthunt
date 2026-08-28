/**
 * DECISION LAYER V1 FROZEN
 * Logic for transparent entity comparison.
 * See: src/docs/decision-layer-v1.md
 */
import { supabase } from "@/integrations/supabase/client";
import { ProjectPublicService, type PublicProject } from "./projects-public";
import { BuilderPublicService, type PublicBuilder } from "./builders-public";
import { getPlaceById } from "./places";
import { 
  DecisionEntityService, 
  DecisionScoreService,
  DecisionDimensionService,
  type DecisionScoreRow,
  type DecisionDimensionRow,
  type DecisionEntityRow
} from "./decision-intelligence";
import { type UserPreference, JourneyService } from "./journey";

export interface ComparableEntity {
  id: string;
  name: string;
  slug: string;
  type: "project";
  projectData: PublicProject;
  builderData: PublicBuilder | null;
  placeData: any | null; 
  decisionEntity: DecisionEntityRow | null;
  scores: DecisionScoreRow[];
}

export interface ComparisonContext {
  entities: ComparableEntity[];
  dimensions: DecisionDimensionRow[];
  preferences: UserPreference[];
}

export const ComparisonService = {
  async getProjectComparison(projectIds: string[]): Promise<ComparisonContext> {
    if (projectIds.length === 0) {
      return { entities: [], dimensions: [], preferences: [] };
    }

    const projectPromises = projectIds.map(id => ProjectPublicService.getProjectById(id));
    const publicProjects = await Promise.all(projectPromises);
    
    const validProjects = publicProjects.filter((p): p is PublicProject => p !== null);

    const entities: ComparableEntity[] = await Promise.all(
      validProjects.map(async (pp) => {
        const builderId = pp.project.builder_id;
        const placeId = pp.project.place_id;

        const [builderData, placeData, decisionEntity] = await Promise.all([
          builderId ? ComparisonService.getBuilderMinimal(builderId) : Promise.resolve(null),
          placeId ? getPlaceById(placeId).catch(() => null) : Promise.resolve(null),
          DecisionEntityService.getByEntity("project", pp.project.id).catch(() => null)
        ]);

        const scores = decisionEntity 
          ? await DecisionScoreService.listAssessmentsByEntity(decisionEntity.id).catch(() => [])
          : [];

        let placeScores: DecisionScoreRow[] = [];
        if (placeId) {
          const placeDE = await DecisionEntityService.getByEntity("place", placeId).catch(() => null);
          if (placeDE) {
            placeScores = await DecisionScoreService.listAssessmentsByEntity(placeDE.id).catch(() => []);
          }
        }

        let builderScores: DecisionScoreRow[] = [];
        if (builderId) {
          const builderDE = await DecisionEntityService.getByEntity("builder", builderId).catch(() => null);
          if (builderDE) {
            builderScores = await DecisionScoreService.listAssessmentsByEntity(builderDE.id).catch(() => []);
          }
        }

        return {
          id: pp.project.id,
          name: pp.project.name,
          slug: pp.project.slug,
          type: "project",
          projectData: pp,
          builderData,
          placeData,
          decisionEntity,
          scores: [...scores, ...placeScores, ...builderScores]
        };
      })
    );

    const allDimensions = await DecisionDimensionService.list(true);
    
    const usedDimensionIds = new Set(entities.flatMap(e => e.scores.map(s => s.dimension_id)));
    const dimensions = allDimensions.filter(d => usedDimensionIds.has(d.id));

    const preferences = JourneyService.getPreferences();

    return {
      entities,
      dimensions,
      preferences
    };
  },
  
  async getBuilderMinimal(id: string): Promise<PublicBuilder | null> {
    const { data, error } = await supabase
      .from("builders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data || (data.status ?? "draft") !== "published") return null;
    
    return {
      builder: data as any,
      media: [],
      relationships: [],
      seo: (data.seo as any) || {},
      risks: [],
      evidence: [],
      promises: [],
      leadership: [],
      certifications: [],
      awards: [],
      rera: [],
      faqs: []
    };
  },

  isCompatible(dim1: DecisionDimensionRow, dim2: DecisionDimensionRow): boolean {
    if (!dim1.compatibility_group || !dim2.compatibility_group) return false;
    return dim1.compatibility_group === dim2.compatibility_group;
  }
};
