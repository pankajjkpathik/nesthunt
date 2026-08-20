import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ProjectIntakeFactory } from "./project-intake-factory";
import { slugify } from "./services/projects-admin";

const intakeRecordSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  builder_slug: z.string().optional(),
  place_slug: z.string().optional(),
  rera_number: z.string().nullable().optional(),
  rera_authority: z.string().nullable().optional(),
  rera_status: z.string().nullable().optional(),
  rera_url: z.string().nullable().optional(),
  property_type: z.string().nullable().optional(),
  construction_status: z.string().nullable().optional(),
  possession_date: z.string().nullable().optional(),
  possession_year: z.number().nullable().optional(),
  starting_price: z.number().nullable().optional(),
  configurations: z.array(z.any()).nullable().optional(),
  amenities: z.array(z.string()).nullable().optional(),
  official_website: z.string().nullable().optional(),
  executive_summary: z.string().nullable().optional(),
  source_urls: z.array(z.string()).nullable().optional(),
  evidence_notes: z.string().nullable().optional(),
});

export const validateIntakeBatch = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.array(intakeRecordSchema).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const builderSlugs = Array.from(new Set(data.map((r: any) => r.builder_slug).filter(Boolean) as string[]));
    const placeSlugs = Array.from(new Set(data.map((r: any) => r.place_slug).filter(Boolean) as string[]));
    const projectSlugs = data.map((r: any) => r.slug || slugify(r.name));
    const reraNumbers = data.map((r: any) => r.rera_number).filter(Boolean) as string[];

    const [buildersRes, placesRes, projectsBySlugRes, projectsByReraRes] = await Promise.all([
      supabaseAdmin.from('builders').select('id, slug, name').in('slug', builderSlugs),
      supabaseAdmin.from('places').select('id, slug, name').in('slug', placeSlugs),
      supabaseAdmin.from('projects').select('id, slug, name, verified').in('slug', projectSlugs),
      reraNumbers.length > 0
        ? supabaseAdmin.from('projects').select('id, rera_number, verified').in('rera_number', reraNumbers)
        : Promise.resolve({ data: [] })
    ]);

    const builderMap = new Map(buildersRes.data?.map(b => [b.slug, b.name]) || []);
    const placeMap = new Map(placesRes.data?.map(p => [p.slug, p.name]) || []);
    const existingBySlug = new Map(projectsBySlugRes.data?.map(p => [p.slug, p]) || []);
    const existingByRera = new Map(projectsByReraRes.data?.map(p => [p.rera_number, p]) || []);

    return data.map((record: any) => {
      const slug = record.slug || slugify(record.name);
      
      if (!record.name) return { status: 'INVALID', reason: 'Missing project name' };
      
      const duplicateBySlug = existingBySlug.get(slug);
      if (duplicateBySlug) return { status: 'DUPLICATE', reason: `Slug already exists: ${slug}`, projectId: duplicateBySlug.id };

      if (record.rera_number) {
        const duplicateByRera = existingByRera.get(record.rera_number);
        if (duplicateByRera) return { status: 'DUPLICATE', reason: `RERA number already exists: ${record.rera_number}`, projectId: duplicateByRera.id };
      }

      if (record.builder_slug && !builderMap.has(record.builder_slug)) {
        return { status: 'NEEDS_REVIEW', reason: `Builder relationship invalid: ${record.builder_slug}` };
      }
      if (!record.builder_slug) return { status: 'NEEDS_REVIEW', reason: 'Missing builder' };

      if (record.place_slug && !placeMap.has(record.place_slug)) {
        return { status: 'NEEDS_REVIEW', reason: `Place relationship invalid: ${record.place_slug}` };
      }
      if (!record.place_slug) return { status: 'NEEDS_REVIEW', reason: 'Missing place' };

      return { status: 'READY', reason: 'Valid record' };
    });
  });

export const executeIntakeBatch = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.array(intakeRecordSchema).parse(d))
  .handler(async ({ data }) => {
    return ProjectIntakeFactory.processBatch(data as any);
  });
