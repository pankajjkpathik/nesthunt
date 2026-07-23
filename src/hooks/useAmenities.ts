import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as svc from "@/lib/services/amenities";
import type { AmenityInsert, AmenityUpdate, ContentStatus } from "@/types/content";

const KEY = ["content", "amenities"] as const;

export function useAmenities() {
  return useQuery({ queryKey: KEY, queryFn: svc.listAmenities });
}

export function useAmenity(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => svc.getAmenity(id!),
    enabled: !!id,
  });
}

export function useAmenityUsageCounts() {
  return useQuery({ queryKey: [...KEY, "usage"], queryFn: svc.getUsageCounts });
}

export function useCreateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AmenityInsert) => svc.createAmenity(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AmenityUpdate }) =>
      svc.updateAmenity(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteAmenity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDuplicateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.duplicateAmenity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useToggleAmenityFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; featured: boolean }) => svc.toggleFeatured(v.id, v.featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkAmenityStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { ids: string[]; status: ContentStatus }) =>
      svc.bulkUpdateStatus(v.ids, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBulkDeleteAmenities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => svc.bulkDelete(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
