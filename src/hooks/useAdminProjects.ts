import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminBulkDeleteProjects,
  adminBulkDuplicateProjects,
  adminBulkUpdateProjectPublishStatus,
  adminCreateProject,
  adminDeleteProject,
  adminDuplicateProject,
  adminGetProject,
  adminListProjects,
  adminUpdateProject,
  type ProjectInsert,
  type ProjectPublishStatus,
  type ProjectRow,
  type ProjectUpdate,
} from "@/lib/services/projects-admin";

export function useAdminProjects() {
  return useQuery({ queryKey: ["admin", "projects"], queryFn: adminListProjects });
}

export function useAdminProject(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "projects", id],
    queryFn: () => adminGetProject(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectInsert) => adminCreateProject(input),
    onSuccess: (row: ProjectRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.setQueryData(["admin", "projects", row.id], row);
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ProjectUpdate }) =>
      adminUpdateProject(id, patch),
    onSuccess: (row: ProjectRow) => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.setQueryData(["admin", "projects", row.id], row);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDuplicateProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}

export function useBulkUpdateProjectPublishStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ProjectPublishStatus }) =>
      adminBulkUpdateProjectPublishStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useBulkDeleteProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminBulkDeleteProjects(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useBulkDuplicateProjects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => adminBulkDuplicateProjects(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "projects"] }),
  });
}
