-- GARDENIA FLOORS PROJECT INTAKE
-- IDENTITY: Gardenia Floors
-- RERA: PBRERA-SAS80-PR0839
-- BUILDER: Omaxe (d9e5ac9d-ca17-4c12-b6e9-c8bbad8ec1cd)
-- PLACE: New Chandigarh (e8576d1b-849a-45e9-a190-3b964b41c6c7)

DO $$
DECLARE
    v_project_id UUID;
    v_builder_id UUID := 'd9e5ac9d-ca17-4c12-b6e9-c8bbad8ec1cd';
    v_place_id UUID := 'e8576d1b-849a-45e9-a190-3b964b41c6c7';
    v_rera_number TEXT := 'PBRERA-SAS80-PR0839';
    v_slug TEXT := 'gardenia-floors';
BEGIN
    -- 1. Upsert Project
    INSERT INTO public.projects (
        name,
        slug,
        builder_id,
        place_id,
        rera_number,
        status,
        publish_status,
        property_type,
        executive_summary,
        metrics,
        rera,
        unit_types,
        amenities,
        progress,
        strengths,
        seo,
        starting_price,
        completion_percentage,
        verified,
        featured
    ) VALUES (
        'Gardenia Floors',
        v_slug,
        v_builder_id,
        v_place_id,
        v_rera_number,
        'under-construction',
        'draft',
        'Residential',
        'Gardenia Floors is a residential project by Omaxe New Chandigarh Developers Pvt. Ltd. in the Integrated Residential Township at New Chandigarh. The project is registered with Punjab RERA under PBRERA-SAS80-PR0839, issued on 9 February 2023 and valid through 31 July 2027. The project is marketed as 3 BHK residences with multiple floor-plan variants. Current market sources describe the project as under construction, while the latest RERA construction figure available in the research record is historical and reports 5.75% completion as of 28 June 2024.',
        '{
            "reraAuthority": "Punjab RERA",
            "reraStatus": "Registered",
            "reraUrl": null,
            "unitTypes": "3 BHK",
            "possessionYear": 2027
        }'::jsonb,
        '{
            "number": "PBRERA-SAS80-PR0839",
            "authority": "Punjab RERA",
            "registrationDate": "2023-02-09",
            "validUntil": "2027-07-31"
        }'::jsonb,
        '[
            {"type": "3 BHK", "area": "280.54 sq yd", "order": 1},
            {"type": "3 BHK", "area": "307.93 sq yd", "order": 2},
            {"type": "3 BHK", "area": "314.03 sq yd", "order": 3},
            {"type": "3 BHK", "area": "318.03 sq yd", "order": 4},
            {"type": "3 BHK + 3 W/R", "order": 5},
            {"type": "3 BHK + 3 W/R + Store", "order": 6},
            {"type": "3 BHK + 3 W/R + Servant Room", "order": 7}
        ]'::jsonb,
        '[
            "Utilities:Power Backup",
            "Utilities:Water Softener",
            "Security:24×7 Security",
            "Security:CCTV Surveillance",
            "Sports:Swimming Pool",
            "Sports:Gym",
            "Sports:Basketball Court",
            "Green Spaces:Landscaped Gardens",
            "Green Spaces:Kids Play Area",
            "Lifestyle:Clubhouse",
            "Convenience:Guest Parking"
        ]'::jsonb,
        ARRAY['Latest RERA construction percentage: 5.75% (as of 28-Jun-2024) - Historical'],
        ARRAY[
            'multiple documented 3 BHK floor-plan variants',
            'New Chandigarh location',
            'registered RERA identity'
        ],
        '{
            "title": "Gardenia Floors | Project Intelligence | NestHunt",
            "description": "Explore Gardenia Floors in New Chandigarh with verified project, RERA, configuration and decision-intelligence information from NestHunt."
        }'::jsonb,
        NULL,
        NULL,
        TRUE,
        FALSE
    )
    ON CONFLICT (slug) DO UPDATE SET
        builder_id = EXCLUDED.builder_id,
        place_id = EXCLUDED.place_id,
        rera_number = EXCLUDED.rera_number,
        status = EXCLUDED.status,
        publish_status = EXCLUDED.publish_status,
        property_type = EXCLUDED.property_type,
        executive_summary = EXCLUDED.executive_summary,
        metrics = projects.metrics || EXCLUDED.metrics,
        rera = projects.rera || EXCLUDED.rera,
        unit_types = EXCLUDED.unit_types,
        amenities = EXCLUDED.amenities,
        progress = EXCLUDED.progress,
        strengths = EXCLUDED.strengths,
        seo = projects.seo || EXCLUDED.seo,
        updated_at = NOW()
    RETURNING id INTO v_project_id;

    -- 2. Ensure Decision Entity
    INSERT INTO public.decision_entities (entity_type, entity_id)
    VALUES ('project', v_project_id)
    ON CONFLICT (entity_type, entity_id) DO NOTHING;
END $$;
