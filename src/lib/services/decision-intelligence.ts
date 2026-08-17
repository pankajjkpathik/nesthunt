/**
 * DECISION LAYER V1 FROZEN
 * Primary entry point for Decision Layer intelligence.
 * Includes: Entities, Dimensions, Scores, Factors, Evidence, Risks, Promises.
 * See: src/docs/decision-layer-v1.md
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

// ---------- Row / Insert / Update types ----------
export type DecisionEntityRow = Tables["decision_entities"]["Row"];
export type DecisionEntityInsert = Tables["decision_entities"]["Insert"];
export type DecisionEntityUpdate = Tables["decision_entities"]["Update"];

export type DecisionDimensionRow = Tables["decision_dimensions"]["Row"];
export type DecisionDimensionInsert = Tables["decision_dimensions"]["Insert"];
export type DecisionDimensionUpdate = Tables["decision_dimensions"]["Update"];

export type DecisionScoreRow = Tables["decision_scores"]["Row"];
export type DecisionScoreInsert = Tables["decision_scores"]["Insert"];
export type DecisionScoreUpdate = Tables["decision_scores"]["Update"];

export type DecisionFactorRow = Tables["decision_factors"]["Row"];
export type DecisionFactorInsert = Tables["decision_factors"]["Insert"];
export type DecisionFactorUpdate = Tables["decision_factors"]["Update"];

export type DecisionEvidenceRow = Tables["decision_evidence"]["Row"];
export type DecisionEvidenceInsert = Tables["decision_evidence"]["Insert"];
export type DecisionEvidenceUpdate = Tables["decision_evidence"]["Update"];

export type DecisionRecommendationRow = Tables["decision_recommendations"]["Row"];
export type DecisionRecommendationInsert = Tables["decision_recommendations"]["Insert"];
export type DecisionRecommendationUpdate = Tables["decision_recommendations"]["Update"];

export type DecisionInsightRow = Tables["decision_insights"]["Row"];
export type DecisionInsightInsert = Tables["decision_insights"]["Insert"];
export type DecisionInsightUpdate = Tables["decision_insights"]["Update"];

export type PromiseLedgerRow = Tables["promise_ledgers"]["Row"];
export type PromiseLedgerInsert = Tables["promise_ledgers"]["Insert"];
export type PromiseLedgerUpdate = Tables["promise_ledgers"]["Update"];

export type EntityRiskRow = Tables["entity_risks"]["Row"];
export type EntityRiskInsert = Tables["entity_risks"]["Insert"];
export type EntityRiskUpdate = Tables["entity_risks"]["Update"];

// ---------- Enum literals ----------
export const DECISION_ENTITY_TYPES = [
  "place",
  "builder",
  "project",
  "school",
  "hospital",
  "infrastructure",
] as const;
export type DecisionEntityType = (typeof DECISION_ENTITY_TYPES)[number];

export const DECISION_STATUSES = ["draft", "review", "published", "archived"] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const FACTOR_TYPES = ["positive", "negative", "neutral"] as const;
export type FactorType = (typeof FACTOR_TYPES)[number];

export const EVIDENCE_SOURCE_TYPES = [
  "government",
  "rera",
  "builder",
  "inspection",
  "media",
  "research",
  "external",
] as const;
export type EvidenceSourceType = (typeof EVIDENCE_SOURCE_TYPES)[number];

export const VERIFICATION_STATUSES = ["verified", "pending", "rejected"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PERSONAS = ["family", "investor", "luxury", "student", "nri", "retiree"] as const;
export type Persona = (typeof PERSONAS)[number];

export const RECOMMENDATION_LEVELS = ["recommended", "consider", "avoid"] as const;
export type RecommendationLevel = (typeof RECOMMENDATION_LEVELS)[number];

export const INSIGHT_CATEGORIES = ["market", "growth", "risk", "builder", "place", "project"] as const;
export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number];

export const RISK_CATEGORIES = ["financial", "legal", "delivery", "market", "reputational", "operational", "regulatory"] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const PROMISE_STATUSES = ["planned", "progress", "completed", "delayed", "cancelled"] as const;
export type PromiseStatus = (typeof PROMISE_STATUSES)[number];

export const RISK_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export const RISK_PROBABILITIES = ["low", "medium", "high"] as const;
export type RiskProbability = (typeof RISK_PROBABILITIES)[number];

export const RISK_STATUSES = ["active", "resolved", "monitoring"] as const;
export type RiskStatus = (typeof RISK_STATUSES)[number];

export const DECISION_SOURCE_TYPES = [
  "LEGACY_MIGRATION",
  "CMS_ASSESSMENT",
  "DERIVED_METRIC",
  "VERIFIED_EVIDENCE",
  "SYSTEM_CALCULATION",
  "USER_INPUT",
] as const;
export type DecisionSourceType = (typeof DECISION_SOURCE_TYPES)[number];


// ============================================================
// DecisionEntityService
// ============================================================
export const DecisionEntityService = {
  async list(filter?: { entityType?: DecisionEntityType; status?: DecisionStatus }): Promise<DecisionEntityRow[]> {
    let q = supabase.from("decision_entities").select("*").order("updated_at", { ascending: false });
    if (filter?.entityType) q = q.eq("entity_type", filter.entityType);
    if (filter?.status) q = q.eq("status", filter.status);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<DecisionEntityRow | null> {
    const { data, error } = await supabase.from("decision_entities").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async getByEntity(entityType: DecisionEntityType, entityId: string): Promise<DecisionEntityRow | null> {
    const { data, error } = await supabase
      .from("decision_entities")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async ensure(entityType: DecisionEntityType, entityId: string): Promise<DecisionEntityRow> {
    const existing = await this.getByEntity(entityType, entityId);
    if (existing) return existing;
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    const { data, error } = await supabase
      .from("decision_entities")
      .insert({ entity_type: entityType, entity_id: entityId, status: "draft", created_by: uid, updated_by: uid })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async create(input: DecisionEntityInsert): Promise<DecisionEntityRow> {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    const payload: DecisionEntityInsert = {
      ...input,
      created_by: input.created_by ?? uid,
      updated_by: input.updated_by ?? uid,
    };
    const { data, error } = await supabase.from("decision_entities").insert(payload).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionEntityUpdate): Promise<DecisionEntityRow> {
    const { data: userRes } = await supabase.auth.getUser();
    const payload: DecisionEntityUpdate = { ...patch, updated_by: patch.updated_by ?? userRes.user?.id ?? null };
    const { data, error } = await supabase.from("decision_entities").update(payload).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async setStatus(id: string, status: DecisionStatus): Promise<DecisionEntityRow> {
    return this.update(id, { status });
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_entities").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// DecisionDimensionService
// ============================================================
export const DecisionDimensionService = {
  async list(activeOnly = false): Promise<DecisionDimensionRow[]> {
    let q = supabase.from("decision_dimensions").select("*").order("display_order", { ascending: true });
    if (activeOnly) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async getByCode(code: string): Promise<DecisionDimensionRow | null> {
    const { data, error } = await supabase.from("decision_dimensions").select("*").eq("code", code).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(input: DecisionDimensionInsert): Promise<DecisionDimensionRow> {
    const { data, error } = await supabase.from("decision_dimensions").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionDimensionUpdate): Promise<DecisionDimensionRow> {
    const { data, error } = await supabase
      .from("decision_dimensions")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_dimensions").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// DecisionScoreService
// ============================================================
export const DecisionScoreService = {
  async listByEntity(decisionEntityId: string): Promise<DecisionScoreRow[]> {
    const { data, error } = await supabase
      .from("decision_scores")
      .select("*")
      .eq("decision_entity_id", decisionEntityId);
    if (error) throw error;
    return data ?? [];
  },

  async upsert(input: DecisionScoreInsert): Promise<DecisionScoreRow> {
    const { data: userRes } = await supabase.auth.getUser();
    const payload: DecisionScoreInsert = {
      ...input,
      calculated_by: input.calculated_by ?? userRes.user?.id ?? null,
    };
    const { data, error } = await supabase
      .from("decision_scores")
      .upsert(payload, { onConflict: "decision_entity_id,dimension_id" })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionScoreUpdate): Promise<DecisionScoreRow> {
    const { data, error } = await supabase.from("decision_scores").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_scores").delete().eq("id", id);
    if (error) throw error;
  },

  /** Check if a dimension is compatible for cross-entity comparison based on compatibility_group. */
  async isCompatible(dim1Code: string, dim2Code: string): Promise<boolean> {
    const d1 = await DecisionDimensionService.getByCode(dim1Code);
    const d2 = await DecisionDimensionService.getByCode(dim2Code);
    if (!d1 || !d2) return false;
    return !!d1.compatibility_group && d1.compatibility_group === d2.compatibility_group;
  },

  /** Classify the provenance of a score. */
  classifyProvenance(score: DecisionScoreRow): "VERIFIED" | "PARTIAL" | "LEGACY" | "PLACEHOLDER" | "UNUSABLE" {
    if (score.calculation_version === "v1_migration" && score.score === 0) return "PLACEHOLDER";
    if (score.source_type === "LEGACY_MIGRATION") return "LEGACY";
    if (score.source_type === "VERIFIED_EVIDENCE" && score.confidence === "high") return "VERIFIED";
    if (score.source_type && score.confidence && score.reason_summary) return "PARTIAL";
    return "UNUSABLE";
  },

};

// ============================================================
// DecisionFactorService
// ============================================================
export const DecisionFactorService = {
  async listByScore(decisionScoreId: string): Promise<DecisionFactorRow[]> {
    const { data, error } = await supabase
      .from("decision_factors")
      .select("*")
      .eq("decision_score_id", decisionScoreId)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: DecisionFactorInsert): Promise<DecisionFactorRow> {
    const { data, error } = await supabase.from("decision_factors").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionFactorUpdate): Promise<DecisionFactorRow> {
    const { data, error } = await supabase.from("decision_factors").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_factors").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// DecisionEvidenceService
// ============================================================
export const DecisionEvidenceService = {
  async listByFactor(decisionFactorId: string): Promise<DecisionEvidenceRow[]> {
    const { data, error } = await supabase
      .from("decision_evidence")
      .select("*")
      .eq("decision_factor_id", decisionFactorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: DecisionEvidenceInsert): Promise<DecisionEvidenceRow> {
    const { data, error } = await supabase.from("decision_evidence").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionEvidenceUpdate): Promise<DecisionEvidenceRow> {
    const { data, error } = await supabase.from("decision_evidence").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async verify(id: string, status: VerificationStatus = "verified"): Promise<DecisionEvidenceRow> {
    const { data: userRes } = await supabase.auth.getUser();
    return this.update(id, {
      verification_status: status,
      verified_by: userRes.user?.id ?? null,
      verified_at: new Date().toISOString(),
    });
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_evidence").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// DecisionRecommendationService
// ============================================================
export const DecisionRecommendationService = {
  async listByEntity(decisionEntityId: string): Promise<DecisionRecommendationRow[]> {
    const { data, error } = await supabase
      .from("decision_recommendations")
      .select("*")
      .eq("decision_entity_id", decisionEntityId);
    if (error) throw error;
    return data ?? [];
  },

  async upsert(input: DecisionRecommendationInsert): Promise<DecisionRecommendationRow> {
    const { data, error } = await supabase
      .from("decision_recommendations")
      .upsert(input, { onConflict: "decision_entity_id,persona" })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionRecommendationUpdate): Promise<DecisionRecommendationRow> {
    const { data, error } = await supabase
      .from("decision_recommendations")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_recommendations").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// DecisionInsightService
// ============================================================
export const DecisionInsightService = {
  async listByEntity(decisionEntityId: string): Promise<DecisionInsightRow[]> {
    const { data, error } = await supabase
      .from("decision_insights")
      .select("*")
      .eq("decision_entity_id", decisionEntityId)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: DecisionInsightInsert): Promise<DecisionInsightRow> {
    const { data, error } = await supabase.from("decision_insights").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: DecisionInsightUpdate): Promise<DecisionInsightRow> {
    const { data, error } = await supabase.from("decision_insights").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("decision_insights").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// PromiseLedgerService (generic)
// ============================================================
export const PromiseLedgerService = {
  async listByEntity(entityType: DecisionEntityType, entityId: string): Promise<PromiseLedgerRow[]> {
    const { data, error } = await supabase
      .from("promise_ledgers")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("announcement_date", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: PromiseLedgerInsert): Promise<PromiseLedgerRow> {
    const { data, error } = await supabase.from("promise_ledgers").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: PromiseLedgerUpdate): Promise<PromiseLedgerRow> {
    const { data, error } = await supabase.from("promise_ledgers").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("promise_ledgers").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// RiskService (generic entity_risks)
// ============================================================
export const RiskService = {
  async listByEntity(entityType: DecisionEntityType, entityId: string): Promise<EntityRiskRow[]> {
    const { data, error } = await supabase
      .from("entity_risks")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("severity", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(input: EntityRiskInsert): Promise<EntityRiskRow> {
    const { data, error } = await supabase.from("entity_risks").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(id: string, patch: EntityRiskUpdate): Promise<EntityRiskRow> {
    const { data, error } = await supabase.from("entity_risks").update(patch).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("entity_risks").delete().eq("id", id);
    if (error) throw error;
  },
};
