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

// -------- Evidence --------
export function usePlaceEvidence(placeId: string | undefined) {
  return useQuery({
    queryKey: ["place-evidence", placeId],
    queryFn: () => listPlaceEvidence(placeId!),
    enabled: !!placeId,
  });
}
export function useCreateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceEvidenceInsert) => createPlaceEvidence(input),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] }),
  });
}
export function useUpdateEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceEvidenceUpdate }) => updatePlaceEvidence(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] }),
  });
}
export function useVerifyEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => verifyPlaceEvidence(id),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-evidence", row.place_id] }),
  });
}
export function useDeleteEvidence(placeId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaceEvidence(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["place-evidence", placeId] }),
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
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-risks", row.place_id] }),
  });
}
export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlaceRiskUpdate }) => updatePlaceRisk(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-risks", row.place_id] }),
  });
}
export function useDeleteRisk(placeId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaceRisk(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["place-risks", placeId] }),
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
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-promises", row.place_id] }),
  });
}
export function useUpdatePromise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PlacePromiseUpdate }) => updatePlacePromise(id, patch),
    onSuccess: (row) => qc.invalidateQueries({ queryKey: ["place-promises", row.place_id] }),
  });
}
export function useDeletePromise(placeId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlacePromise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["place-promises", placeId] }),
  });
}
