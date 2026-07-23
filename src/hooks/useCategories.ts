import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/lib/services/categories";
import type { CategoryInsert, CategoryUpdate, ContentStatus } from "@/types/content";

const KEY = ["content", "categories"] as const;

export function useCategories() {
  return useQuery({ queryKey: KEY, queryFn: svc.listCategories });
}

export function useCategoryTree() {
  const { data, ...rest } = useCategories();
  const tree = useMemo(() => svc.buildTree(data ?? []), [data]);
  return { tree, ...rest };
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => svc.getCategory(id!),
    enabled: !!id,
  });
}

export function useCategoryUsageCounts() {
  return useQuery({ queryKey: [...KEY, "usage"], queryFn: svc.getUsageCounts });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInsert) => svc.createCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CategoryUpdate }) =>
      svc.updateCategory(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDuplicateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.duplicateCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { ids: string[]; status: ContentStatus }) =>
      svc.bulkUpdateStatus(v.ids, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkDeleteCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => svc.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
