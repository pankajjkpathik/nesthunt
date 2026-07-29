import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DecisionEntityService,
  DecisionDimensionService,
  DecisionScoreService,
  DecisionFactorService,
  DecisionEvidenceService,
  DecisionRecommendationService,
  DecisionInsightService,
  PromiseLedgerService,
  RiskService,
  type DecisionEntityInsert,
  type DecisionEntityType,
  type DecisionEntityUpdate,
  type DecisionDimensionInsert,
  type DecisionDimensionUpdate,
  type DecisionScoreInsert,
  type DecisionScoreUpdate,
  type DecisionFactorInsert,
  type DecisionFactorUpdate,
  type DecisionEvidenceInsert,
  type DecisionEvidenceUpdate,
  type DecisionRecommendationInsert,
  type DecisionRecommendationUpdate,
  type DecisionInsightInsert,
  type DecisionInsightUpdate,
  type DecisionStatus,
  type PromiseLedgerInsert,
  type PromiseLedgerUpdate,
  type EntityRiskInsert,
  type EntityRiskUpdate,
  type VerificationStatus,
} from "@/lib/services/decision-intelligence";

// ============================================================
// BUILD-017 — React Query hooks for the Decision Intelligence layer
// ============================================================

export const diKeys = {
  entities: ["di", "entities"] as const,
  entity: (id: string) => ["di", "entity", id] as const,
  entityByRef: (t: DecisionEntityType, id: string) => ["di", "entity-by-ref", t, id] as const,
  dimensions: (activeOnly: boolean) => ["di", "dimensions", activeOnly] as const,
  scores: (entityId: string) => ["di", "scores", entityId] as const,
  factors: (scoreId: string) => ["di", "factors", scoreId] as const,
  evidence: (factorId: string) => ["di", "evidence", factorId] as const,
  recommendations: (entityId: string) => ["di", "recommendations", entityId] as const,
  insights: (entityId: string) => ["di", "insights", entityId] as const,
  promises: (t: DecisionEntityType, id: string) => ["di", "promises", t, id] as const,
  risks: (t: DecisionEntityType, id: string) => ["di", "risks", t, id] as const,
};

// ---------- Decision Entity ----------
export function useDecisionEntities(filter?: { entityType?: DecisionEntityType; status?: DecisionStatus }) {
  return useQuery({
    queryKey: [...diKeys.entities, filter?.entityType ?? null, filter?.status ?? null] as const,
    queryFn: () => DecisionEntityService.list(filter),
  });
}
export function useDecisionEntity(id: string | undefined) {
  return useQuery({
    queryKey: diKeys.entity(id ?? ""),
    queryFn: () => DecisionEntityService.getById(id!),
    enabled: !!id,
  });
}
export function useDecisionEntityByRef(entityType: DecisionEntityType | undefined, entityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.entityByRef(entityType ?? "place", entityId ?? ""),
    queryFn: () => DecisionEntityService.getByEntity(entityType!, entityId!),
    enabled: !!entityType && !!entityId,
  });
}
export function useEnsureDecisionEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { entityType: DecisionEntityType; entityId: string }) =>
      DecisionEntityService.ensure(input.entityType, input.entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.entities }),
  });
}
export function useCreateDecisionEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionEntityInsert) => DecisionEntityService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.entities }),
  });
}
export function useUpdateDecisionEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionEntityUpdate }) =>
      DecisionEntityService.update(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: diKeys.entity(row.id) });
      qc.invalidateQueries({ queryKey: diKeys.entities });
    },
  });
}
export function useSetDecisionEntityStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DecisionStatus }) =>
      DecisionEntityService.setStatus(id, status),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: diKeys.entity(row.id) });
      qc.invalidateQueries({ queryKey: diKeys.entities });
    },
  });
}
export function useDeleteDecisionEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionEntityService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.entities }),
  });
}

// ---------- Dimensions ----------
export function useDecisionDimensions(activeOnly = false) {
  return useQuery({
    queryKey: diKeys.dimensions(activeOnly),
    queryFn: () => DecisionDimensionService.list(activeOnly),
  });
}
export function useCreateDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionDimensionInsert) => DecisionDimensionService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["di", "dimensions"] }),
  });
}
export function useUpdateDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionDimensionUpdate }) =>
      DecisionDimensionService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["di", "dimensions"] }),
  });
}
export function useDeleteDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionDimensionService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["di", "dimensions"] }),
  });
}

// ---------- Scores ----------
export function useDecisionScores(decisionEntityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.scores(decisionEntityId ?? ""),
    queryFn: () => DecisionScoreService.listByEntity(decisionEntityId!),
    enabled: !!decisionEntityId,
  });
}
export function useUpsertDecisionScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionScoreInsert) => DecisionScoreService.upsert(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.scores(row.decision_entity_id) }),
  });
}
export function useUpdateDecisionScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionScoreUpdate }) => DecisionScoreService.update(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.scores(row.decision_entity_id) }),
  });
}
export function useDeleteDecisionScore(decisionEntityId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionScoreService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.scores(decisionEntityId ?? "") }),
  });
}

// ---------- Factors ----------
export function useDecisionFactors(decisionScoreId: string | undefined) {
  return useQuery({
    queryKey: diKeys.factors(decisionScoreId ?? ""),
    queryFn: () => DecisionFactorService.listByScore(decisionScoreId!),
    enabled: !!decisionScoreId,
  });
}
export function useCreateDecisionFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionFactorInsert) => DecisionFactorService.create(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.factors(row.decision_score_id) }),
  });
}
export function useUpdateDecisionFactor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionFactorUpdate }) =>
      DecisionFactorService.update(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.factors(row.decision_score_id) }),
  });
}
export function useDeleteDecisionFactor(decisionScoreId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionFactorService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.factors(decisionScoreId ?? "") }),
  });
}

// ---------- Evidence ----------
export function useDecisionEvidence(decisionFactorId: string | undefined) {
  return useQuery({
    queryKey: diKeys.evidence(decisionFactorId ?? ""),
    queryFn: () => DecisionEvidenceService.listByFactor(decisionFactorId!),
    enabled: !!decisionFactorId,
  });
}
export function useCreateDecisionEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionEvidenceInsert) => DecisionEvidenceService.create(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.evidence(row.decision_factor_id) }),
  });
}
export function useUpdateDecisionEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionEvidenceUpdate }) =>
      DecisionEvidenceService.update(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.evidence(row.decision_factor_id) }),
  });
}
export function useVerifyDecisionEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: VerificationStatus }) =>
      DecisionEvidenceService.verify(id, status),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.evidence(row.decision_factor_id) }),
  });
}
export function useDeleteDecisionEvidence(decisionFactorId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionEvidenceService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.evidence(decisionFactorId ?? "") }),
  });
}

// ---------- Recommendations ----------
export function useDecisionRecommendations(decisionEntityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.recommendations(decisionEntityId ?? ""),
    queryFn: () => DecisionRecommendationService.listByEntity(decisionEntityId!),
    enabled: !!decisionEntityId,
  });
}
export function useUpsertDecisionRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionRecommendationInsert) => DecisionRecommendationService.upsert(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.recommendations(row.decision_entity_id) }),
  });
}
export function useUpdateDecisionRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionRecommendationUpdate }) =>
      DecisionRecommendationService.update(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.recommendations(row.decision_entity_id) }),
  });
}
export function useDeleteDecisionRecommendation(decisionEntityId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionRecommendationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.recommendations(decisionEntityId ?? "") }),
  });
}

// ---------- Insights ----------
export function useDecisionInsights(decisionEntityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.insights(decisionEntityId ?? ""),
    queryFn: () => DecisionInsightService.listByEntity(decisionEntityId!),
    enabled: !!decisionEntityId,
  });
}
export function useCreateDecisionInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionInsightInsert) => DecisionInsightService.create(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.insights(row.decision_entity_id) }),
  });
}
export function useUpdateDecisionInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionInsightUpdate }) =>
      DecisionInsightService.update(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: diKeys.insights(row.decision_entity_id) }),
  });
}
export function useDeleteDecisionInsight(decisionEntityId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DecisionInsightService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: diKeys.insights(decisionEntityId ?? "") }),
  });
}

// ---------- Promise Ledger ----------
export function usePromiseLedger(entityType: DecisionEntityType | undefined, entityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.promises(entityType ?? "place", entityId ?? ""),
    queryFn: () => PromiseLedgerService.listByEntity(entityType!, entityId!),
    enabled: !!entityType && !!entityId,
  });
}
export function useCreatePromiseLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PromiseLedgerInsert) => PromiseLedgerService.create(input),
    onSuccess: (row) =>
      qc.invalidateQueries({ queryKey: diKeys.promises(row.entity_type as DecisionEntityType, row.entity_id) }),
  });
}
export function useUpdatePromiseLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PromiseLedgerUpdate }) => PromiseLedgerService.update(id, patch),
    onSuccess: (row) =>
      qc.invalidateQueries({ queryKey: diKeys.promises(row.entity_type as DecisionEntityType, row.entity_id) }),
  });
}
export function useDeletePromiseLedger(entityType: DecisionEntityType | undefined, entityId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PromiseLedgerService.remove(id),
    onSuccess: () =>
      entityType && entityId && qc.invalidateQueries({ queryKey: diKeys.promises(entityType, entityId) }),
  });
}

// ---------- Risks ----------
export function useEntityRisks(entityType: DecisionEntityType | undefined, entityId: string | undefined) {
  return useQuery({
    queryKey: diKeys.risks(entityType ?? "place", entityId ?? ""),
    queryFn: () => RiskService.listByEntity(entityType!, entityId!),
    enabled: !!entityType && !!entityId,
  });
}
export function useCreateEntityRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EntityRiskInsert) => RiskService.create(input),
    onSuccess: (row) =>
      qc.invalidateQueries({ queryKey: diKeys.risks(row.entity_type as DecisionEntityType, row.entity_id) }),
  });
}
export function useUpdateEntityRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: EntityRiskUpdate }) => RiskService.update(id, patch),
    onSuccess: (row) =>
      qc.invalidateQueries({ queryKey: diKeys.risks(row.entity_type as DecisionEntityType, row.entity_id) }),
  });
}
export function useDeleteEntityRisk(entityType: DecisionEntityType | undefined, entityId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RiskService.remove(id),
    onSuccess: () => entityType && entityId && qc.invalidateQueries({ queryKey: diKeys.risks(entityType, entityId) }),
  });
}
