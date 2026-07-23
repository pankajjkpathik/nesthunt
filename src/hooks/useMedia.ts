import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAsset,
  listAssets,
  listUsages,
  listUsagesForEntity,
  type EntityType,
  type MediaFilters,
} from "@/lib/services/media";
import {
  bulkAddTags,
  bulkArchive,
  bulkDeleteAssets,
  bulkUpdateFolder,
  deleteAsset,
  linkMedia,
  replaceAsset,
  unlinkAllForEntity,
  unlinkMedia,
  updateAssetMetadata,
  uploadAsset,
  type LinkInput,
  type MetadataPatch,
  type UploadInput,
} from "@/lib/services/media-admin";

const KEY = ["media", "assets"] as const;

export function useMediaAssets(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => listAssets(filters),
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "one", id],
    queryFn: () => getAsset(id!),
    enabled: !!id,
  });
}

export function useAssetUsages(id: string | undefined) {
  return useQuery({
    queryKey: [...KEY, "usages", id],
    queryFn: () => listUsages(id!),
    enabled: !!id,
  });
}

export function useEntityMedia(
  entityType: EntityType | undefined,
  entityId: string | undefined,
  field?: string,
) {
  return useQuery({
    queryKey: ["media", "entity", entityType, entityId, field],
    queryFn: () => listUsagesForEntity(entityType!, entityId!, field),
    enabled: !!entityType && !!entityId,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["media"] });
  qc.invalidateQueries({ queryKey: ["entity_images"] });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadInput) => uploadAsset(input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReplaceMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => replaceAsset(id, file),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateMediaMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: MetadataPatch }) =>
      updateAssetMetadata(id, patch),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => deleteAsset(id, force),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useBulkDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, force }: { ids: string[]; force?: boolean }) =>
      bulkDeleteAssets(ids, force),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useBulkUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, folder }: { ids: string[]; folder: string }) =>
      bulkUpdateFolder(ids, folder),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useBulkArchive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, archived }: { ids: string[]; archived: boolean }) =>
      bulkArchive(ids, archived),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useBulkAddTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, tags }: { ids: string[]; tags: string[] }) => bulkAddTags(ids, tags),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useLinkMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LinkInput) => linkMedia(input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUnlinkMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (usageId: string) => unlinkMedia(usageId),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUnlinkAllForEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      field,
    }: {
      entityType: EntityType;
      entityId: string;
      field?: string;
    }) => unlinkAllForEntity(entityType, entityId, field),
    onSuccess: () => invalidateAll(qc),
  });
}
