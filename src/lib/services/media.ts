import { supabase } from "@/integrations/supabase/client";

export type EntityType = "place" | "builder" | "project";

export interface EntityImage {
  id: string;
  storagePath: string;
  alt: string;
  sortOrder: number;
}

export interface EntityDocument {
  id: string;
  title: string;
  url: string;
  kind: string;
  sortOrder: number;
}

export interface EntityScore {
  id: string;
  label: string;
  score: number;
  scale: number;
  sortOrder: number;
}

export async function listEntityImages(
  entityType: EntityType,
  entityId: string,
): Promise<EntityImage[]> {
  const { data, error } = await supabase
    .from("entity_images")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    storagePath: r.storage_path,
    alt: r.alt,
    sortOrder: r.sort_order,
  }));
}

export async function listEntityDocuments(
  entityType: EntityType,
  entityId: string,
): Promise<EntityDocument[]> {
  const { data, error } = await supabase
    .from("entity_documents")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    kind: r.kind,
    sortOrder: r.sort_order,
  }));
}

export async function listEntityScores(
  entityType: EntityType,
  entityId: string,
): Promise<EntityScore[]> {
  const { data, error } = await supabase
    .from("entity_scores")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    label: r.label,
    score: Number(r.score),
    scale: Number(r.scale),
    sortOrder: r.sort_order,
  }));
}
