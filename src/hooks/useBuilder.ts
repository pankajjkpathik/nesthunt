import { useQuery } from "@tanstack/react-query";
import { BuilderPublicService } from "@/lib/services/builders-public";

const FIVE_MINUTES = 5 * 60 * 1000;

const baseOptions = {
  staleTime: FIVE_MINUTES,
  gcTime: FIVE_MINUTES,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

export function useBuilder(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "builder", slug],
    queryFn: () => BuilderPublicService.getBuilderBySlug(slug!),
    enabled: !!slug,
    ...baseOptions,
  });
}

/** Projects are only fetched once the builder record exists. */
export function useBuilderProjects(builderId: string | undefined) {
  return useQuery({
    queryKey: ["public", "builder", builderId, "projects"],
    queryFn: () => BuilderPublicService.getRelatedProjects(builderId!),
    enabled: !!builderId,
    ...baseOptions,
  });
}

export function useRelatedBuilders(builderId: string | undefined) {
  return useQuery({
    queryKey: ["public", "builder", builderId, "related-builders"],
    queryFn: () => BuilderPublicService.getRelatedBuilders(builderId!),
    enabled: !!builderId,
    ...baseOptions,
  });
}
