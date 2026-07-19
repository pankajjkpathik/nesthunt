import { useQuery } from "@tanstack/react-query";
import { listPlaces, getPlaceBySlug } from "@/lib/services/places";
import { listBuilders, getBuilderBySlug } from "@/lib/services/builders";
import { listProjects, getProjectBySlug } from "@/lib/services/projects";
import {
  listEntityImages,
  listEntityDocuments,
  listEntityScores,
  type EntityType,
} from "@/lib/services/media";

export function usePlaces(opts?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["places", opts ?? null],
    queryFn: () => listPlaces(opts),
  });
}

export function usePlace(slug: string | undefined) {
  return useQuery({
    queryKey: ["places", "slug", slug],
    queryFn: () => getPlaceBySlug(slug!),
    enabled: !!slug,
  });
}

export function useBuilders(opts?: { featuredOnly?: boolean }) {
  return useQuery({
    queryKey: ["builders", opts ?? null],
    queryFn: () => listBuilders(opts),
  });
}

export function useBuilder(slug: string | undefined) {
  return useQuery({
    queryKey: ["builders", "slug", slug],
    queryFn: () => getBuilderBySlug(slug!),
    enabled: !!slug,
  });
}

export function useProjects(opts?: { featuredOnly?: boolean; placeId?: string; builderId?: string }) {
  return useQuery({
    queryKey: ["projects", opts ?? null],
    queryFn: () => listProjects(opts),
  });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["projects", "slug", slug],
    queryFn: () => getProjectBySlug(slug!),
    enabled: !!slug,
  });
}

export function useEntityImages(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: ["entity_images", entityType, entityId],
    queryFn: () => listEntityImages(entityType, entityId!),
    enabled: !!entityId,
  });
}

export function useEntityDocuments(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: ["entity_documents", entityType, entityId],
    queryFn: () => listEntityDocuments(entityType, entityId!),
    enabled: !!entityId,
  });
}

export function useEntityScores(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: ["entity_scores", entityType, entityId],
    queryFn: () => listEntityScores(entityType, entityId!),
    enabled: !!entityId,
  });
}
