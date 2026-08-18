-- LAUNCH-002K.2 — CELESTIA ROYAL 2C REGULATORY EVIDENCE RESOLUTION

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

    -- Create Celestia Royal 2C Project
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
        'under-construction',
        'Residential'
    ) RETURNING id INTO v_project_id;

    -- Register Decision Entity
    INSERT INTO public.decision_entities (
        entity_id,
        entity_type,
        status
    ) VALUES (
        v_project_id,
        'project',
        'published'
    ) RETURNING id INTO v_decision_entity_id;

    -- Find 'risk' dimension
    SELECT id INTO v_dimension_id FROM public.decision_dimensions WHERE code = 'risk';

    -- Create Decision Score (0.0 scale)
    INSERT INTO public.decision_scores (
        decision_entity_id,
        dimension_id,
        score,
        status,
        source_type,
        max_score,
        weight,
        confidence,
        calculation_version
    ) VALUES (
        v_decision_entity_id,
        v_dimension_id,
        0.0,
        'published',
        'SYSTEM_CALCULATION',
        10.0,
        1.0,
        'high',
        'v1'
    ) RETURNING id INTO v_decision_score_id;

    -- Create Factor
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

    -- Record 1
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

    -- Record 2
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