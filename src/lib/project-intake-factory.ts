
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/services/projects-admin";
import { ProjectGovernanceService } from "@/lib/services/project-governance";
import { DecisionEntityService } from "@/lib/services/decision-intelligence";

export interface IntakeRecord {
  name: string;
  slug?: string;
  builder_slug?: string;
  place_slug?: string;
  rera_number?: string;
  property_type?: string;
  summary?: string;
  // Deliberately sparse to test NULL preservation
}

export interface IntakeResult {
  status: 'CREATED' | 'UPDATED' | 'SKIPPED_DUPLICATE' | 'NEEDS_REVIEW' | 'FAILED';
  projectId?: string;
  reason?: string;
  details?: any;
}

export const ProjectIntakeFactory = {
  async processBatch(records: IntakeRecord[]): Promise<IntakeResult[]> {
    const results: IntakeResult[] = [];
    for (const record of records) {
      try {
        const result = await this.processRecord(record);
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

  async processRecord(record: IntakeRecord): Promise<IntakeResult> {
    const slug = record.slug || slugify(record.name);
    
    // 1. DUPLICATE CHECK
    // Check by slug
    const { data: bySlug } = await supabase.from('projects').select('id, name, builder_id').eq('slug', slug).maybeSingle();
    if (bySlug) {
      return { status: 'SKIPPED_DUPLICATE', projectId: bySlug.id, reason: 'Duplicate slug detected' };
    }

    // Check by RERA
    if (record.rera_number) {
       const { data: byRera } = await supabase.from('projects').select('id').eq('rera_number', record.rera_number).maybeSingle();
       if (byRera) {
         return { status: 'SKIPPED_DUPLICATE', projectId: byRera.id, reason: 'Duplicate RERA number detected' };
       }
    }

    // 2. RESOLVE BUILDER
    let builderId: string | null = null;
    if (record.builder_slug) {
      const { data: builder } = await supabase.from('builders').select('id').eq('slug', record.builder_slug).maybeSingle();
      if (!builder) {
        return { status: 'NEEDS_REVIEW', reason: `Builder resolution failed for slug: ${record.builder_slug}` };
      }
      builderId = builder.id;
    } else {
        return { status: 'NEEDS_REVIEW', reason: 'Missing builder_slug' };
    }

    // 3. RESOLVE PLACE
    let placeId: string | null = null;
    if (record.place_slug) {
      const { data: place } = await supabase.from('places').select('id').eq('slug', record.place_slug).maybeSingle();
      if (!place) {
        return { status: 'NEEDS_REVIEW', reason: `Place resolution failed for slug: ${record.place_slug}` };
      }
      placeId = place.id;
    } else {
        return { status: 'NEEDS_REVIEW', reason: 'Missing place_slug' };
    }

    // 4. CREATE DRAFT PROJECT
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

    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert(insertData)
      .select('id')
      .single();

    if (createError) throw createError;

    // 5. ENSURE GOVERNANCE
    await ProjectGovernanceService.ensureGovernance(project.id);

    // 6. ENSURE DECISION ENTITY
    await DecisionEntityService.ensure('project', project.id);

    return { status: 'CREATED', projectId: project.id };
  }
};
