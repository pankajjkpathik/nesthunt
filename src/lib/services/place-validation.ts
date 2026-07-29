import { supabase } from "@/integrations/supabase/client";
import type { PlaceRow } from "@/lib/services/places-admin";

export interface PublishCheck {
  ok: boolean;
  failures: string[];
}

/**
 * Publish gate for Place Intelligence.
 * Required to move a Place to `published`:
 *  - Official name
 *  - Slug
 *  - Coordinates (lat + lng)
 *  - Executive summary
 *  - ≥1 Strength (highlight)
 *  - ≥1 Risk (either narrative risks[] or place_risks child row)
 *  - ≥1 Evidence record
 *  - ≥1 Builder OR Project relationship
 */
export async function checkPublishReadiness(place: PlaceRow): Promise<PublishCheck> {
  const failures: string[] = [];

  const officialName = (place as PlaceRow & { official_name?: string | null }).official_name ?? place.name;
  if (!officialName || !officialName.trim()) failures.push("Official name is required");
  if (!place.slug || !place.slug.trim()) failures.push("Slug is required");

  const lat = (place as PlaceRow & { latitude?: number | null }).latitude ?? null;
  const lng = (place as PlaceRow & { longitude?: number | null }).longitude ?? null;
  if (lat == null || lng == null) failures.push("Coordinates (lat/lng) are required");

  if (!place.executive_summary || !place.executive_summary.trim()) {
    failures.push("Executive summary is required");
  }
  if (!place.highlights?.length) failures.push("At least one Strength / highlight is required");

  // Risks — accept either narrative list or structured place_risks
  const [{ count: risksCount }, { count: evidenceCount }, { count: builderRels }, { count: projectRels }] =
    await Promise.all([
      supabase.from("place_risks").select("id", { count: "exact", head: true }).eq("place_id", place.id),
      supabase.from("place_evidence").select("id", { count: "exact", head: true }).eq("place_id", place.id),
      supabase
        .from("entity_relationships")
        .select("id", { count: "exact", head: true })
        .eq("from_type", "place")
        .eq("from_id", place.id)
        .eq("to_type", "builder"),
      supabase
        .from("entity_relationships")
        .select("id", { count: "exact", head: true })
        .eq("from_type", "place")
        .eq("from_id", place.id)
        .eq("to_type", "project"),
    ]);

  const totalRisks = (risksCount ?? 0) + (place.risks?.length ?? 0);
  if (totalRisks === 0) failures.push("At least one Risk is required");
  if ((evidenceCount ?? 0) === 0) failures.push("At least one Evidence record is required");
  if ((builderRels ?? 0) + (projectRels ?? 0) === 0) {
    failures.push("At least one linked Builder OR Project is required");
  }

  return { ok: failures.length === 0, failures };
}
