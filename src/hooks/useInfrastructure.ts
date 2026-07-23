import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/lib/services/infrastructure";
import type {
  ContentStatus,
  InfrastructureInsert,
  InfrastructureUpdate,
} from "@/types/content";

const KEY = ["content", "infrastructure"] as const;
const LINKS_KEY = ["content", "infrastructure-links"] as const;

export function useInfrastructure() {
  return useQuery({ queryKey: KEY, queryFn: svc.listInfrastructure });
}

export function useInfrastructureItem(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => svc.getInfrastructure(id!),
    enabled: !!id,
  });
}

export function useInfrastructureUsageCounts() {
  return useQuery({ queryKey: [...KEY, "usage"], queryFn: svc.getUsageCounts });
}

export function useInfrastructureLinks(entityType: "place" | "project", entityId?: string) {
  return useQuery({
    queryKey: [...LINKS_KEY, entityType, entityId],
    queryFn: () => svc.listLinksForEntity(entityType, entityId!),
    enabled: !!entityId,
  });
}

export function useCreateInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InfrastructureInsert) => svc.createInfrastructure(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: InfrastructureUpdate }) =>
      svc.updateInfrastructure(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteInfrastructure(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkInfrastructureStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { ids: string[]; status: ContentStatus }) =>
      svc.bulkUpdateStatus(v.ids, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkDeleteInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => svc.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAttachInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.attachInfrastructure,
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: [...LINKS_KEY, vars.entityType, vars.entityId] });
      qc.invalidateQueries({ queryKey: [...KEY, "usage"] });
    },
  });
}

export function useUpdateInfrastructureLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      id: string;
      patch: { distance_km?: number | null; notes?: string | null; sort_order?: number };
    }) => svc.updateLink(v.id, v.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: LINKS_KEY }),
  });
}

export function useDetachInfrastructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => svc.detachInfrastructure(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LINKS_KEY });
      qc.invalidateQueries({ queryKey: [...KEY, "usage"] });
    },
  });
}
