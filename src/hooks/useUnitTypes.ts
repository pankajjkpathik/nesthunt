import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/lib/services/unitTypes";
import type { ContentStatus, UnitTypeInsert, UnitTypeUpdate } from "@/types/content";

const KEY = ["content", "unit-types"] as const;

export function useUnitTypes() {
  return useQuery({ queryKey: KEY, queryFn: svc.listUnitTypes });
}

export function useUnitType(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => svc.getUnitType(id!),
    enabled: !!id,
  });
}

export function useUnitTypeUsageCounts() {
  return useQuery({ queryKey: [...KEY, "usage"], queryFn: svc.getUsageCounts });
}

export function useCreateUnitType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UnitTypeInsert) => svc.createUnitType(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateUnitType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UnitTypeUpdate }) =>
      svc.updateUnitType(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteUnitType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteUnitType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkUnitTypeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { ids: string[]; status: ContentStatus }) =>
      svc.bulkUpdateStatus(v.ids, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkDeleteUnitTypes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => svc.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
