import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EvidenceInputSchema = z.object({
  projectSlug: z.string(),
  reraNumber: z.string(),
  evidenceType: z.enum(['RERA_REGISTRATION', 'RERA_PROGRESS_UPDATE', 'OFFICIAL_COMPLETION_OR_OCCUPANCY_UPDATE']),
  sourceTitle: z.string(),
  sourceUrl: z.string().optional(),
  publishedDate: z.string().optional(), // ISO date
  remarks: z.string(),
  confidence: z.enum(['high', 'medium', 'low']).default('high'),
  verificationStatus: z.enum(['verified', 'official_record', 'official_update']).default('verified'),
});

export const ingestProjectEvidence = createServerFn({ method: "POST" })
  .inputValidator((data) => z.array(EvidenceInputSchema).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    
    const results = [];
    
    // 0. Get dimension IDs
    const { data: dimensions } = await supabaseAdmin
      .from('decision_dimensions')
      .select('id, code');
    
    const riskDimensionId = dimensions?.find(d => d.code === 'risk')?.id;
    
    if (!riskDimensionId) {
      throw new Error("Missing required dimension (risk)");
    }

    for (const item of data) {
      // 1. Resolve project and entity
      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('id, name, rera_number')
        .eq('slug', item.projectSlug)
        .single();
      
      if (!project) {
        results.push({ project: item.projectSlug, result: 'NOT_ELIGIBLE', error: 'Project not found' });
        continue;
      }

      const { data: entity } = await supabaseAdmin
        .from('decision_entities')
        .select('id')
        .eq('entity_id', project.id)
        .single();

      if (!entity) {
        results.push({ project: item.projectSlug, result: 'NOT_ELIGIBLE', error: 'Decision entity not found' });
        continue;
      }

      // 2. Ensure Score exists (defaulting to Risk for regulatory evidence)
      let { data: score } = await supabaseAdmin
        .from('decision_scores')
        .select('id')
        .eq('decision_entity_id', entity.id)
        .eq('dimension_id', riskDimensionId)
        .single();
      
      if (!score) {
        const { data: newScore, error: scoreError } = await supabaseAdmin
          .from('decision_scores')
          .insert({
            decision_entity_id: entity.id,
            dimension_id: riskDimensionId,
            score: 5.0,
            max_score: 10.0,
            weight: 1.0,
            confidence: 'medium',
            calculation_version: '1.0.0',
            calculated_at: new Date().toISOString(),
            // LAUNCH-002S: structural shell required to anchor evidence — never an assessment
            is_placeholder: true,
            status: 'draft'
          })
          .select('id')
          .single();
        
        if (scoreError) {
          results.push({ project: project.name, result: 'CONFLICT_REQUIRES_REVIEW', error: 'Failed to create score' });
          continue;
        }
        score = newScore;
      }

      // 3. Ensure Factor exists
      let { data: factor } = await supabaseAdmin
        .from('decision_factors')
        .select('id, evidence_count')
        .eq('decision_score_id', score!.id)
        .eq('title', 'Regulatory Disclosures')
        .single();
      
      if (!factor) {
        const { data: newFactor, error: factorError } = await supabaseAdmin
          .from('decision_factors')
          .insert({
            decision_score_id: score!.id,
            title: 'Regulatory Disclosures',
            factor_type: 'evidence',
            impact: 0,
            evidence_count: 0,
            display_order: 0
          })
          .select('id, evidence_count')
          .single();
        
        if (factorError) {
          results.push({ project: project.name, result: 'CONFLICT_REQUIRES_REVIEW', error: 'Failed to create factor' });
          continue;
        }
        factor = newFactor;
      }

      // 4. Check for duplicate evidence
      const { data: existingEvidence } = await supabaseAdmin
        .from('decision_evidence')
        .select('id')
        .eq('decision_factor_id', factor!.id)
        .eq('source_title', item.sourceTitle)
        .eq('source_type', 'rera')
        .single();
      
      if (existingEvidence) {
        results.push({ 
          project: project.name, 
          evidenceType: item.evidenceType, 
          source: item.sourceTitle, 
          date: item.publishedDate || 'N/A', 
          result: 'SKIPPED_DUPLICATE' 
        });
        continue;
      }

      // 5. Ingest Evidence
      const { error: ingestError } = await supabaseAdmin
        .from('decision_evidence')
        .insert({
          decision_factor_id: factor!.id,
          source_type: 'rera',
          source_title: item.sourceTitle,
          source_url: item.sourceUrl,
          published_date: item.publishedDate,
          verification_status: 'verified',
          confidence: item.confidence,
          remarks: item.remarks
        });
      
      if (ingestError) {
        results.push({ project: project.name, result: 'CONFLICT_REQUIRES_REVIEW', error: ingestError.message });
      } else {
        // Increment evidence count on factor manually since RPC missing
        await supabaseAdmin
          .from('decision_factors')
          .update({ evidence_count: (factor!.evidence_count || 0) + 1 })
          .eq('id', factor!.id);
        
        results.push({ 
          project: project.name, 
          evidenceType: item.evidenceType, 
          source: item.sourceTitle, 
          date: item.publishedDate || 'N/A', 
          result: 'CREATED' 
        });
      }
    }
    
    return results;
  });
