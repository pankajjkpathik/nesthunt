import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminBulkDeleteBuilders,
  adminBulkUpdateBuilderStatus,
  adminBulkVerifyBuilders,
  adminCreateBuilder,
  adminDeleteBuilder,
  adminDuplicateBuilder,
  adminGetBuilder,
  adminListBuilders,
  adminUpdateBuilder,
  attachBuilderPlace,
  detachBuilderPlace,
  listBuilderPlaces,
  listBuilderProjects,
  type BuilderInsert,
  type BuilderRow,
  type BuilderStatus,
  type BuilderUpdate,
} from "@/lib/services/builders-admin";

export function useAdminBuilders() {
  return useQuery({
    queryKey: ["admin", "builders"],
    queryFn: adminListBuilders,
  });
}

export function useAdminBuilder(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "builders", id],
    queryFn: () => adminGetBuilder(id!),
    enabled: !!id,
  });
}

export function useCreateBuilder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BuilderInsert) => adminCreateBuilder(input),
    onSuccess: (row: BuilderRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
      qc.invalidateQueries({ queryKey: ["builders"] });
      qc.setQueryData(["admin", "builders", row.id], row);
    },
  });
}

export function useUpdateBuilder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: BuilderUpdate }) =>
      adminUpdateBuilder(id, patch),
    onSuccess: (row: BuilderRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
      qc.invalidateQueries({ queryKey: ["builders"] });
      qc.setQueryData(["admin", "builders", row.id], row);
    },
  });
}

export function useDeleteBuilder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteBuilder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
      qc.invalidateQueries({ queryKey: ["builders"] });
    },
  });
}

export function useDuplicateBuilder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDuplicateBuilder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
    },
  });
}

export function useBulkUpdateBuilderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: BuilderStatus }) =>
      adminBulkUpdateBuilderStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
      qc.invalidateQueries({ queryKey: ["builders"] });
    },
  });
}

export function useBulkVerifyBuilders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, verified }: { ids: string[]; verified: boolean }) =>
      adminBulkVerifyBuilders(ids, verified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
    },
  });
}

export function useBulkDeleteBuilders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminBulkDeleteBuilders(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "builders"] });
      qc.invalidateQueries({ queryKey: ["builders"] });
    },
  });
}

export function useBuilderPlaces(builderId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "builders", builderId, "places"],
    queryFn: () => listBuilderPlaces(builderId!),
    enabled: !!builderId,
  });
}

export function useAttachBuilderPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ builderId, placeId }: { builderId: string; placeId: string }) =>
      attachBuilderPlace(builderId, placeId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "builders", vars.builderId, "places"] });
    },
  });
}

export function useDetachBuilderPlace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ builderId, placeId }: { builderId: string; placeId: string }) =>
      detachBuilderPlace(builderId, placeId),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "builders", vars.builderId, "places"] });
    },
  });
}

export function useBuilderProjects(builderId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "builders", builderId, "projects"],
    queryFn: () => listBuilderProjects(builderId!),
    enabled: !!builderId,
  });
}
