-- LAUNCH-002K.2 — CELESTIA ROYAL 2C REGULATORY EVIDENCE RESOLUTION

-- 1. Get Builder ID for Omaxe
DO $$
DECLARE
    v_builder_id UUID;
    v_project_id UUID;
    v_decision_entity_id UUID;
    v_decision_score_id UUID;
    v_dimension_id UUID;
    v_factor_id UUID;
BEGIN
    -- Find Omaxe
    SELECT id INTO v_builder_id FROM public.builders WHERE name ILIKE '%Omaxe%' LIMIT 1;
    
    IF v_builder_id IS NULL THEN
        RAISE EXCEPTION 'Builder Omaxe not found';
    END IF;

    -- 2. Create Celestia Royal 2C Project
    INSERT INTO public.projects (
        name,
        slug,
        builder_id,
        rera_number,
        publish_status,
        status,
        property_type
    ) VALUES (
        'Celestia Royal 2C',
        'celestia-royal-2c',
        v_builder_id,
        'PBRERA-SAS80-PR0884',
        'published',
        'active',
        'Residential'
    ) RETURNING id INTO v_project_id;

    -- 3. Register Decision Entity
    INSERT INTO public.decision_entities (
        entity_id,
        entity_type,
        display_name,
        publish_status
    ) VALUES (
        v_project_id,
        'project',
        'Celestia Royal 2C',
        'published'
    ) RETURNING id INTO v_decision_entity_id;

    -- 4. Create Decision Score (0.00 scale, per normalization rules)
    INSERT INTO public.decision_scores (
        decision_entity_id,
        score_value,
        status,
        provenance_type
    ) VALUES (
        v_decision_entity_id,
        0.00,
        'published',
        'FACT'
    ) RETURNING id INTO v_decision_score_id;

    -- 5. Find 'risk' dimension
    SELECT id INTO v_dimension_id FROM public.decision_dimensions WHERE code = 'risk';

    -- 6. Create Factor (Neutral impact, per requirement "Do NOT create a score/risk severity")
    INSERT INTO public.decision_factors (
        decision_score_id,
        title,
        description,
        factor_type,
        impact,
        display_order
    ) VALUES (
        v_decision_score_id,
        'Regulatory Disclosures',
        'Official regulatory proceeding references identified from RERA Punjab cause lists.',
        'neutral',
        1,
        0
    ) RETURNING id INTO v_factor_id;

    -- 7. Add Record 1 Evidence
    INSERT INTO public.decision_evidence (
        decision_factor_id,
        source_type,
        source_title,
        published_date,
        verification_status,
        confidence,
        remarks
    ) VALUES (
        v_factor_id,
        'rera',
        'OFFICIAL RERA CAUSE LIST (2627)',
        '2025-03-26',
        'verified',
        'high',
        'Reference: 2627. Authority: RERA Punjab. Listed party: Omaxe New Chandigarh Developers Pvt Ltd. Outcome: Outcome not yet verified from a substantive order.'
    );

    -- 8. Add Record 2 Evidence
    INSERT INTO public.decision_evidence (
        decision_factor_id,
        source_type,
        source_title,
        published_date,
        verification_status,
        confidence,
        remarks
    ) VALUES (
        v_factor_id,
        'rera',
        'OFFICIAL RERA CAUSE LIST (2684)',
        '2026-03-17',
        'verified',
        'high',
        'Reference: RERA/PS/M(BKS)/2026/2684. Authority: RERA Punjab. Punjab RERA cause lists record hearings on 17 March 2026 and 21 April 2026. Outcome: Outcome not yet verified from a substantive order.'
    );

END $$;

-- GRANTs already exist on these tables, but re-asserting for safety as per instructions
GRANT SELECT ON public.projects TO authenticated, anon;
GRANT SELECT ON public.decision_entities TO authenticated, anon;
GRANT SELECT ON public.decision_scores TO authenticated, anon;
GRANT SELECT ON public.decision_factors TO authenticated, anon;
GRANT SELECT ON public.decision_evidence TO authenticated, anon;
