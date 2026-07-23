import { supabase } from "@/integrations/supabase/client";

export interface ContentHealthEntry {
  id: string;
  name: string;
  slug: string;
}

export interface ContentHealthReport {
  totals: {
    categories: number;
    amenities: number;
    infrastructure: number;
    unitTypes: number;
  };
  unused: {
    categories: ContentHealthEntry[];
    amenities: ContentHealthEntry[];
    infrastructure: ContentHealthEntry[];
    unitTypes: ContentHealthEntry[];
  };
  missingIcons: {
    categories: ContentHealthEntry[];
    amenities: ContentHealthEntry[];
  };
  missingSeo: {
    categories: ContentHealthEntry[];
    amenities: ContentHealthEntry[];
  };
  duplicates: {
    categories: Array<{ slug: string; count: number }>;
    amenities: Array<{ slug: string; count: number }>;
    infrastructure: Array<{ slug: string; count: number }>;
    unitTypes: Array<{ slug: string; count: number }>;
  };
}

function findDuplicates<T extends { slug: string }>(rows: T[]) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.slug, (map.get(r.slug) ?? 0) + 1);
  return Array.from(map.entries())
    .filter(([, c]) => c > 1)
    .map(([slug, count]) => ({ slug, count }));
}

function seoIsMissing(seo: unknown): boolean {
  const s = (seo ?? {}) as { title?: string; description?: string };
  return !s.title || !s.description;
}

export async function getContentHealth(): Promise<ContentHealthReport> {
  const [cats, ams, inf, unit, unusedCats, unusedAms, unusedInf, unusedUnit] = await Promise.all([
    supabase.from("categories").select("id,name,slug,icon,seo"),
    supabase.from("amenities").select("id,name,slug,icon,seo"),
    supabase.from("infrastructure_items").select("id,name,slug"),
    supabase.from("unit_types").select("id,name,slug"),
    supabase.rpc("content_unused_categories"),
    supabase.rpc("content_unused_amenities"),
    supabase.rpc("content_unused_infrastructure"),
    supabase.rpc("content_unused_unit_types"),
  ]);

  const catsData = cats.data ?? [];
  const amsData = ams.data ?? [];
  const infData = inf.data ?? [];
  const unitData = unit.data ?? [];

  return {
    totals: {
      categories: catsData.length,
      amenities: amsData.length,
      infrastructure: infData.length,
      unitTypes: unitData.length,
    },
    unused: {
      categories: (unusedCats.data ?? []) as ContentHealthEntry[],
      amenities: (unusedAms.data ?? []) as ContentHealthEntry[],
      infrastructure: (unusedInf.data ?? []) as ContentHealthEntry[],
      unitTypes: (unusedUnit.data ?? []) as ContentHealthEntry[],
    },
    missingIcons: {
      categories: catsData
        .filter((c) => !c.icon)
        .map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      amenities: amsData
        .filter((a) => !a.icon)
        .map((a) => ({ id: a.id, name: a.name, slug: a.slug })),
    },
    missingSeo: {
      categories: catsData
        .filter((c) => seoIsMissing(c.seo))
        .map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      amenities: amsData
        .filter((a) => seoIsMissing(a.seo))
        .map((a) => ({ id: a.id, name: a.name, slug: a.slug })),
    },
    duplicates: {
      categories: findDuplicates(catsData),
      amenities: findDuplicates(amsData),
      infrastructure: findDuplicates(infData),
      unitTypes: findDuplicates(unitData),
    },
  };
}
