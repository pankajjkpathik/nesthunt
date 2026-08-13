import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlaceEvidence,
  createPlacePromise,
  createPlaceRisk,
  deletePlaceEvidence,
  deletePlacePromise,
  deletePlaceRisk,
  listPlaceEvidence,
  listPlacePromises,
  listPlaceRisks,
  updatePlaceEvidence,
  updatePlacePromise,
  updatePlaceRisk,
  verifyPlaceEvidence,
  type PlaceEvidenceInsert,
  type PlaceEvidenceUpdate,
  type PlacePromiseInsert,
  type PlacePromiseUpdate,
  type PlaceRiskInsert,
  type PlaceRiskUpdate,
} from "@/lib/services/place-intelligence";
import { 
  EvidenceService, 
  RiskService, 
  PromiseLedgerService,
  type DecisionEntityType 
} from "@/lib/services/decision-intelligence";

// -------- Evidence --------
export function usePlaceEvidence(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-evidence", placeId],
    queryFn: () => listPlaceEvidence(placeId!),
    enabled: !!placeId,
  });
}

/**
 * @deprecated Use useEntityEvidence for generic entities
 */
export function useCreateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceEvidenceInsert) => createPlaceEvidence(input),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-evidence", row.builder_id] });
    },
  });
}

export function useUpdateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceEvidenceUpdate }) => updatePlaceEvidence(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-evidence", row.builder_id] });
    },
  });
}

export function useVerifyEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyPlaceEvidence(id),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-evidence", row.builder_id] });
    },
  });
}

export function useDeleteEvidence(entityId: string | undefined, entityType: DecisionEntityType = 'place') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaceEvidence(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`${entityType}-evidence`, entityId] });
    },
  });
}

// Builder Specific Evidence Hooks
export function useBuilderEvidence(builderId: string | undefined) {
  return useQuery({
    queryKey: ["builder-evidence", builderId],
    queryFn: () => EvidenceService.listByEntity("builder", builderId!),
    enabled: !!builderId,
  });
}

// -------- Risks --------
export function usePlaceRisks(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-risks", placeId],
    queryFn: () => listPlaceRisks(placeId!),
    enabled: !!placeId,
  });
}

export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceRiskInsert) => createPlaceRisk(input),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-risks", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-risks", row.builder_id] });
    },
  });
}

export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceRiskUpdate }) => updatePlaceRisk(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-risks", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-risks", row.builder_id] });
    },
  });
}

export function useDeleteRisk(entityId: string | undefined, entityType: DecisionEntityType = 'place') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaceRisk(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`${entityType}-risks`, entityId] });
    },
  });
}

// -------- Promises --------
export function usePlacePromises(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-promises", placeId],
    queryFn: () => listPlacePromises(placeId!),
    enabled: !!placeId,
  });
}

export function useCreatePromise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlacePromiseInsert) => createPlacePromise(input),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-promises", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-promises", row.builder_id] });
    },
  });
}

export function useUpdatePromise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlacePromiseUpdate }) => updatePlacePromise(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["place-promises", row.place_id] });
      if (row.builder_id) qc.invalidateQueries({ queryKey: ["builder-promises", row.builder_id] });
    },
  });
}

export function useDeletePromise(entityId: string | undefined, entityType: DecisionEntityType = 'place') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlacePromise(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`${entityType}-promises`, entityId] });
    },
  });
}

