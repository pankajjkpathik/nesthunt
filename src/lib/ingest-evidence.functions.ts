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
    const builderTrustDimensionId = dimensions?.find(d => d.code === 'builder_trust')?.id;
    
    if (!riskDimensionId || !builderTrustDimensionId) {
      throw new Error("Missing required dimensions (risk or builder_trust)");
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
            score: 5.0, // Neutral start
            max_score: 10.0,
            weight: 1.0,
            confidence: 'medium',
            calculation_version: '1.0.0',
            calculated_at: new Date().toISOString(),
            status: 'active'
          })
          .select('id')
          .single();
        
        if (scoreError) {
          results.push({ project: item.projectSlug, result: 'CONFLICT_REQUIRES_REVIEW', error: 'Failed to create score' });
          continue;
        }
        score = newScore;
      }

      // 3. Ensure Factor exists
      let { data: factor } = await supabaseAdmin
        .from('decision_factors')
        .select('id')
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
          .select('id')
          .single();
        
        if (factorError) {
          results.push({ project: item.projectSlug, result: 'CONFLICT_REQUIRES_REVIEW', error: 'Failed to create factor' });
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
          verification_status: 'verified', // Using 'verified' as identified in R.1/schema
          confidence: item.confidence,
          remarks: item.remarks
        });
      
      if (ingestError) {
        results.push({ project: project.name, result: 'CONFLICT_REQUIRES_REVIEW', error: ingestError.message });
      } else {
        // Increment evidence count on factor
        await supabaseAdmin.rpc('increment_evidence_count', { factor_id: factor!.id });
        
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
