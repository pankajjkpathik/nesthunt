import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/services/projects-admin";

export interface IntakeRecord {
  name: string;
  slug?: string;
  builder_slug?: string;
  place_slug?: string;
  rera_number?: string;
  property_type?: string;
  summary?: string;
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
    const results: IntakeResult[] = [];
    for (const record of records) {
      try {
        const result = await this.processRecord(record, supabaseAdmin);
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

  async processRecord(record: IntakeRecord, supabaseAdmin: any): Promise<IntakeResult> {
    const slug = record.slug || slugify(record.name);
    
    const { data: bySlug } = await supabaseAdmin.from('projects').select('id, name').eq('slug', slug).maybeSingle();
    if (bySlug) {
      return { status: 'SKIPPED_DUPLICATE', projectId: bySlug.id, reason: 'Duplicate slug detected' };
    }

    if (record.rera_number) {
       const { data: byRera } = await supabaseAdmin.from('projects').select('id').eq('rera_number', record.rera_number).maybeSingle();
       if (byRera) {
         return { status: 'SKIPPED_DUPLICATE', projectId: byRera.id, reason: 'Duplicate RERA number detected' };
       }
    }

    let builderId: string | null = null;
    if (record.builder_slug) {
      const { data: builder } = await supabaseAdmin.from('builders').select('id').eq('slug', record.builder_slug).maybeSingle();
      if (!builder) {
        return { status: 'NEEDS_REVIEW', reason: `Builder resolution failed for slug: ${record.builder_slug}` };
      }
      builderId = builder.id;
    } else {
        return { status: 'NEEDS_REVIEW', reason: 'Missing builder_slug' };
    }

    let placeId: string | null = null;
    if (record.place_slug) {
      const { data: place } = await supabaseAdmin.from('places').select('id').eq('slug', record.place_slug).maybeSingle();
      if (!place) {
        return { status: 'NEEDS_REVIEW', reason: `Place resolution failed for slug: ${record.place_slug}` };
      }
      placeId = place.id;
    } else {
        return { status: 'NEEDS_REVIEW', reason: 'Missing place_slug' };
    }

    const insertData: any = {
      name: record.name,
      slug,
      builder_id: builderId,
      place_id: placeId,
      rera_number: record.rera_number || null,
      property_type: record.property_type || null,
      summary: record.summary || '',
      publish_status: 'draft',
      verified: false
    };

    const { data: project, error: createError } = await supabaseAdmin
      .from('projects')
      .insert(insertData)
      .select('id')
      .single();

    if (createError) throw createError;

    // Direct registration bypassing service layer for test run
    await supabaseAdmin.from('project_governance').insert({ 
      project_id: project.id, 
      intake_status: 'DRAFT', 
      verification_level: 'STANDARD' 
    });

    await supabaseAdmin.from('decision_entities').insert({ 
      entity_type: 'project', 
      entity_id: project.id, 
      status: 'draft' 
    });

    return { status: 'CREATED', projectId: project.id };
  }
};
