import { supabase } from "@/integrations/supabase/client";
import { listEntityImages, type EntityImage } from "@/lib/services/media";
import { getRelatedEntities } from "@/lib/services/relationships";
import { 
  listPlaceRisks, 
  listPlaceEvidence, 
  listPlacePromises,
  type PlaceRiskRow,
  type PlaceEvidenceRow,
  type PlacePromiseRow 
} from "@/lib/services/place-intelligence";
import type { RelatedEntity } from "@/types/relationships";
import type { BuilderRow, BuilderSeo } from "@/lib/services/builders-admin";

export interface PublicBuilderProject {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  status: string;
  constructionStatus: string | null;
  placeId: string | null;
}

export interface PublicBuilder {
  builder: BuilderRow;
  media: EntityImage[];
  relationships: RelatedEntity[];
  seo: BuilderSeo;
}

/**
 * Read-only data access for the public Builder Detail page.
 * Only `published` builders are returned — RLS also enforces this.
 */
export const BuilderPublicService = {
  async getBuilderBySlug(slug: string): Promise<PublicBuilder | null> {
    const { data, error } = await supabase
      .from("builders")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;

    const row = data as BuilderRow | null;
    if (!row || (row.status ?? "draft") !== "published") return null;

    const [media, relationships] = await Promise.all([
      listEntityImages("builder", row.id).catch(() => [] as EntityImage[]),
      getRelatedEntities({ type: "builder", id: row.id }).catch(
        () => [] as RelatedEntity[],
      ),
    ]);

    return {
      builder: row,
      media,
      relationships,
      seo: (row.seo ?? {}) as BuilderSeo,
    };
  },

  async getRelatedProjects(builderId: string): Promise<PublicBuilderProject[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("id,slug,name,tagline,status,construction_status,place_id")
      .eq("builder_id", builderId)
      .eq("publish_status", "published")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      tagline: (r as { tagline: string | null }).tagline ?? null,
      status: r.status,
      constructionStatus:
        (r as { construction_status: string | null }).construction_status ?? null,
      placeId: r.place_id ?? null,
    }));
  },

  async getRelatedBuilders(builderId: string): Promise<RelatedEntity[]> {
    const related = await getRelatedEntities({ type: "builder", id: builderId });
    return related.filter((r) => r.type === "builder");
  },
};
