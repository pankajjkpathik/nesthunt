import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachEntity,
  detachEntity,
  getEntityGraph,
  getRelatedEntities,
  getRelationshipHealth,
  getUsage,
  searchEntities,
  syncRelationships,
  type EntitySearchResult,
} from "@/lib/services/relationships";
import type { EntityRef, EntityType } from "@/types/relationships";

const relKey = (ref: EntityRef, kind?: string) =>
  ["relationships", ref.type, ref.id, kind ?? "*"] as const;
const usageKey = (ref: EntityRef) => ["usage", ref.type, ref.id] as const;
const graphKey = (ref: EntityRef, depth: number) =>
  ["entity-graph", ref.type, ref.id, depth] as const;

export function useRelatedEntities(ref: EntityRef | undefined, kind?: string) {
  return useQuery({
    queryKey: ref ? relKey(ref, kind) : ["relationships", "disabled"],
    queryFn: () => getRelatedEntities(ref!, kind),
    enabled: !!ref?.id,
  });
}

export function useRelatedBuilders(ref: EntityRef | undefined) {
  return useRelatedEntities(ref, "builders");
}
export function useRelatedProjects(ref: EntityRef | undefined) {
  return useRelatedEntities(ref, "projects");
}
export function useRelatedPlaces(ref: EntityRef | undefined) {
  return useRelatedEntities(ref, "places");
}

export function useEntityGraph(ref: EntityRef | undefined, depth: 0 | 1 | 2 = 1) {
  return useQuery({
    queryKey: ref ? graphKey(ref, depth) : ["entity-graph", "disabled"],
    queryFn: () => getEntityGraph(ref!, depth),
    enabled: !!ref?.id,
  });
}

export function useEntityUsage(ref: EntityRef | undefined) {
  return useQuery({
    queryKey: ref ? usageKey(ref) : ["usage", "disabled"],
    queryFn: () => getUsage(ref!),
    enabled: !!ref?.id,
  });
}

function invalidatePair(qc: ReturnType<typeof useQueryClient>, a: EntityRef, b: EntityRef) {
  qc.invalidateQueries({ queryKey: ["relationships", a.type, a.id] });
  qc.invalidateQueries({ queryKey: ["relationships", b.type, b.id] });
  qc.invalidateQueries({ queryKey: ["usage", a.type, a.id] });
  qc.invalidateQueries({ queryKey: ["usage", b.type, b.id] });
  qc.invalidateQueries({ queryKey: ["entity-graph", a.type, a.id] });
  qc.invalidateQueries({ queryKey: ["entity-graph", b.type, b.id] });
  qc.invalidateQueries({ queryKey: ["relationship-health"] });
}

export function useAttachEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      from: EntityRef;
      to: EntityRef;
      kind: string;
      meta?: Record<string, unknown>;
    }) => attachEntity(input),
    onSuccess: (_r, vars) => invalidatePair(qc, vars.from, vars.to),
  });
}

export function useDetachEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { relationshipId: string; from: EntityRef; to: EntityRef }) =>
      detachEntity(input.relationshipId),
    onSuccess: (_r, vars) => invalidatePair(qc, vars.from, vars.to),
  });
}

export function useSyncRelationships() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      from: EntityRef;
      toType: EntityType;
      kind: string;
      targetIds: string[];
    }) => syncRelationships(input),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ["relationships", vars.from.type, vars.from.id] });
      qc.invalidateQueries({ queryKey: ["entity-graph", vars.from.type, vars.from.id] });
    },
  });
}

export function useEntitySearch(input: {
  types: EntityType[];
  query: string;
  excludeIds?: string[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["entity-search", input.types, input.query, input.excludeIds ?? []],
    queryFn: () =>
      searchEntities({
        types: input.types,
        query: input.query,
        excludeIds: input.excludeIds,
      }) as Promise<EntitySearchResult[]>,
    enabled: input.enabled ?? true,
    staleTime: 15_000,
  });
}

export function useRelationshipHealth() {
  return useQuery({
    queryKey: ["relationship-health"],
    queryFn: getRelationshipHealth,
    staleTime: 30_000,
  });
}
