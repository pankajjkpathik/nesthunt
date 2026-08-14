import { supabase } from "@/integrations/supabase/client";
import { listEntityImages, type EntityImage } from "@/lib/services/media";
import { getRelatedEntities } from "@/lib/services/relationships";
import { 
  listPlaceEvidence, 
  type PlaceEvidenceRow,
} from "@/lib/services/place-intelligence";
import {
  RiskService,
  PromiseLedgerService,
  type EntityRiskRow,
  type PromiseLedgerRow,
} from "@/lib/services/decision-intelligence";
import type { RelatedEntity } from "@/types/relationships";
import { 
  type BuilderRow, 
  type BuilderSeo,
  type LeadershipMember,
  type CertificationEntry,
  type AwardEntry,
  type ReraEntry,
  type BuilderFaq,
  listBuilderLeadership,
  listBuilderCertifications,
  listBuilderAwards,
  listBuilderReraRecords,
  listBuilderFaqs
} from "@/lib/services/builders-admin";

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
  risks: EntityRiskRow[];
  evidence: PlaceEvidenceRow[];
  promises: PromiseLedgerRow[];
  leadership: LeadershipMember[];
  certifications: CertificationEntry[];
  awards: AwardEntry[];
  rera: ReraEntry[];
  faqs: BuilderFaq[];
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

    const [
      media, 
      relationships, 
      risks, 
      evidence, 
      promises,
      leadership,
      certifications,
      awards,
      rera,
      faqs
    ] = await Promise.all([
      listEntityImages("builder", row.id).catch(() => [] as EntityImage[]),
      getRelatedEntities({ type: "builder", id: row.id }).catch(
        () => [] as RelatedEntity[],
      ),
      RiskService.listByEntity("builder", row.id).catch(() => [] as EntityRiskRow[]),
      listPlaceEvidence(row.id).catch(() => [] as PlaceEvidenceRow[]),
      PromiseLedgerService.listByEntity("builder", row.id).catch(() => [] as PromiseLedgerRow[]),
      listBuilderLeadership(row.id).catch(() => [] as LeadershipMember[]),
      listBuilderCertifications(row.id).catch(() => [] as CertificationEntry[]),
      listBuilderAwards(row.id).catch(() => [] as AwardEntry[]),
      listBuilderReraRecords(row.id).catch(() => [] as ReraEntry[]),
      listBuilderFaqs(row.id).catch(() => [] as BuilderFaq[]),
    ]);

    return {
      builder: row,
      media,
      relationships,
      seo: (row.seo ?? {}) as BuilderSeo,
      risks,
      evidence,
      promises,
      leadership,
      certifications,
      awards,
      rera,
      faqs,
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
