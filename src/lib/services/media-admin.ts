import { supabase } from "@/integrations/supabase/client";
import type { EntityType } from "@/lib/services/media";

const BUCKET = "entity-media";

export function getPublicUrl(storagePath: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function uploadMedia(file: File, entityType: EntityType, entityId: string) {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${entityType}/${entityId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function addEntityImage(
  entityType: EntityType,
  entityId: string,
  storagePath: string,
  alt = "",
  sortOrder = 0,
) {
  const { data, error } = await supabase
    .from("entity_images")
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      storage_path: storagePath,
      alt,
      sort_order: sortOrder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeEntityImage(id: string, storagePath?: string) {
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }
  const { error } = await supabase.from("entity_images").delete().eq("id", id);
  if (error) throw error;
}
