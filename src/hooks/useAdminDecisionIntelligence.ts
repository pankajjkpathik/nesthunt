import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  RiskService, 
  PromiseLedgerService,
  type EntityRiskInsert,
  type EntityRiskUpdate,
  type PromiseLedgerInsert,
  type PromiseLedgerUpdate,
  type DecisionEntityType
} from "@/lib/services/decision-intelligence";

export function useCreateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EntityRiskInsert) => RiskService.create(input),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["di", "risks", row.entity_type, row.entity_id] });
    },
  });
}

export function useUpdateRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: EntityRiskUpdate }) => RiskService.update(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["di", "risks", row.entity_type, row.entity_id] });
    },
  });
}

export function useDeleteRisk(entityId: string | undefined, entityType: DecisionEntityType = 'builder') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RiskService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["di", "risks", entityType, entityId] });
    },
  });
}

export function useCreatePromise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PromiseLedgerInsert) => PromiseLedgerService.create(input),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["di", "promises", row.entity_type, row.entity_id] });
    },
  });
}

export function useUpdatePromise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PromiseLedgerUpdate }) => PromiseLedgerService.update(id, patch),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["di", "promises", row.entity_type, row.entity_id] });
    },
  });
}

export function useDeletePromise(entityId: string | undefined, entityType: DecisionEntityType = 'builder') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PromiseLedgerService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["di", "promises", entityType, entityId] });
    },
  });
}
