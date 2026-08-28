import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/services/projects-admin";

export interface IntakeRecord {
  name: string;
  slug?: string;
  builder_slug?: string;
  place_slug?: string;
  rera_number?: string | null;
  rera_authority?: string | null;
  rera_status?: string | null;
  rera_url?: string | null;
  property_type?: string | null;
  construction_status?: string | null;
  possession_date?: string | null;
  possession_year?: number | null;
  starting_price?: number | null;
  configurations?: any[] | null;
  amenities?: string[] | null;
  official_website?: string | null;
  executive_summary?: string | null;
  source_urls?: string[] | null;
  evidence_notes?: string | null;
}

export interface IntakeResult {
  status: 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'NEEDS_REVIEW' | 'FAILED';
  projectId?: string;
  reason?: string;
  details?: any;
}

export const ProjectIntakeFactory = {
  async processBatch(records: IntakeRecord[]): Promise<IntakeResult[]> {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    // 1. PRE-FETCH DATA FOR OPTIMIZATION (Prevent N+1)
    const builderSlugs = Array.from(new Set(records.map(r => r.builder_slug).filter(Boolean) as string[]));
    const placeSlugs = Array.from(new Set(records.map(r => r.place_slug).filter(Boolean) as string[]));
    const projectSlugs = records.map(r => r.slug || slugify(r.name));
    const reraNumbers = records.map(r => r.rera_number).filter(Boolean) as string[];

    const [buildersRes, placesRes, projectsBySlugRes, projectsByReraRes] = await Promise.all([
      supabaseAdmin.from('builders').select('id, slug').in('slug', builderSlugs),
      supabaseAdmin.from('places').select('id, slug').in('slug', placeSlugs),
      supabaseAdmin.from('projects').select('id, slug, name, verified').in('slug', projectSlugs),
      reraNumbers.length > 0 
        ? supabaseAdmin.from('projects').select('id, rera_number, verified').in('rera_number', reraNumbers)
        : Promise.resolve({ data: [] })
    ]);

    const builderMap = new Map(buildersRes.data?.map(b => [b.slug, b.id]) || []);
    const placeMap = new Map(placesRes.data?.map(p => [p.slug, p.id]) || []);
    const existingBySlug = new Map(projectsBySlugRes.data?.map(p => [p.slug, p]) || []);
    const existingByRera = new Map(projectsByReraRes.data?.map(p => [p.rera_number, p]) || []);

    const results: IntakeResult[] = [];
    
    for (const record of records) {
      try {
        const slug = record.slug || slugify(record.name);
        
        // 2. DUPLICATE CHECK (Using pre-fetched data)
        const duplicateBySlug = existingBySlug.get(slug);
        if (duplicateBySlug) {
          results.push({ 
            status: 'SKIPPED_DUPLICATE', 
            projectId: duplicateBySlug.id, 
            reason: `Duplicate slug detected: ${slug}` 
          });
          continue;
        }

        if (record.rera_number) {
          const duplicateByRera = existingByRera.get(record.rera_number);
          if (duplicateByRera) {
            results.push({ 
              status: 'SKIPPED_DUPLICATE', 
              projectId: duplicateByRera.id, 
              reason: `Duplicate RERA number detected: ${record.rera_number}` 
            });
            continue;
          }
        }

        // 3. RESOLVE RELATIONSHIPS (Using pre-fetched maps)
        let builderId: string | null = null;
        if (record.builder_slug) {
          builderId = builderMap.get(record.builder_slug) || null;
          if (!builderId) {
            results.push({ status: 'NEEDS_REVIEW', reason: `Builder resolution failed for slug: ${record.builder_slug}` });
            continue;
          }
        } else {
          results.push({ status: 'NEEDS_REVIEW', reason: 'Missing builder_slug' });
          continue;
        }

        let placeId: string | null = null;
        if (record.place_slug) {
          placeId = placeMap.get(record.place_slug) || null;
          if (!placeId) {
            results.push({ status: 'NEEDS_REVIEW', reason: `Place resolution failed for slug: ${record.place_slug}` });
            continue;
          }
        } else {
          results.push({ status: 'NEEDS_REVIEW', reason: 'Missing place_slug' });
          continue;
        }

        // 4. CREATE RECORD
        const result = await this.processRecord(record, supabaseAdmin, { builderId, placeId, slug });
        results.push(result);
      } catch (error: any) {
        results.push({
          status: 'FAILED',
          reason: error.message || 'Unknown error'
        });
      }
    }
    return results;
  },

  async processRecord(
    record: IntakeRecord, 
    supabaseAdmin: any, 
    resolved: { builderId: string, placeId: string, slug: string }
  ): Promise<IntakeResult> {
    // CREATE DRAFT PROJECT
    const insertData: any = {
      name: record.name,
      slug: resolved.slug,
      builder_id: resolved.builderId,
      place_id: resolved.placeId,
      rera_number: record.rera_number || null,
      property_type: record.property_type || null,
      construction_status: record.construction_status || null,
      starting_price: record.starting_price || null,
      possession_date: record.possession_date || null,
      summary: record.executive_summary || '',
      executive_summary: record.executive_summary || null,
      amenities: record.amenities || [],
      unit_types: record.configurations || [],
      publish_status: 'draft',
      verified: false,
      metrics: {
        possessionYear: record.possession_year || null,
        reraAuthority: record.rera_authority || null,
        reraStatus: record.rera_status || null,
        reraUrl: record.rera_url || null,
      },
      hero: {
        url: record.official_website || null,
      },
      progress: record.evidence_notes ? [record.evidence_notes] : [],
      legal: record.source_urls || [],
    };

    const { data: project, error: createError } = await supabaseAdmin
      .from('projects')
      .insert(insertData)
      .select('id')
      .single();

    if (createError) throw createError;

    // INFRASTRUCTURE REGISTRATION
    try {
      await Promise.all([
        supabaseAdmin.from('project_governance').insert({ 
          project_id: project.id, 
          intake_status: 'DRAFT', 
          verification_level: 'STANDARD',
          // LAUNCH-002S: real intake always enters the production workflow
          record_classification: 'PRODUCTION' 
        }),
        supabaseAdmin.from('decision_entities').insert({ 
          entity_type: 'project', 
          entity_id: project.id, 
          status: 'draft' 
        })
      ]);
    } catch (e) {
      console.warn("Infrastructure registration partial failure for:", project.id, e);
    }

    return { status: 'CREATED', projectId: project.id };
  }
};
