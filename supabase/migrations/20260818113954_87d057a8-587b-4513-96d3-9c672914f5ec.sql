-- GARDENIA FLOORS LATEST RERA PROGRESS UPDATE
-- Project UUID: ccbc4389-78f2-4855-b6b6-5e5c82b42576
-- RERA: PBRERA-SAS80-PR0839
-- Latest official record: 38.42% as of 05-Jun-2025 (Punjab RERA)

DO $$
DECLARE
    v_project_id UUID := 'ccbc4389-78f2-4855-b6b6-5e5c82b42576';
    v_new_summary TEXT := 'Gardenia Floors is a residential project by Omaxe New Chandigarh Developers Pvt. Ltd. in the Integrated Residential Township at New Chandigarh. The project is registered with Punjab RERA under PBRERA-SAS80-PR0839, issued on 9 February 2023 and valid through 31 July 2027. The project is marketed as 3 BHK residences with multiple floor-plan variants. Current market sources describe the project as under construction. The latest official RERA construction record reports 38.42% completion as of 05 June 2025 (historical). Previous records include 5.75% completion as of 28 June 2024.';
BEGIN
    -- Update the project with the new progress record and updated summary
    UPDATE public.projects
    SET 
        -- Append to existing progress array (most recent first)
        progress = ARRAY[
            'Punjab RERA construction percentage: 38.42% (as of 05-Jun-2025) - Official historical update',
            'Latest RERA construction percentage: 5.75% (as of 28-Jun-2024) - Historical'
        ],
        -- Update executive summary to reflect the latest historical data
        executive_summary = v_new_summary,
        -- Ensure completion_percentage remains NULL as instructed
        completion_percentage = NULL,
        -- Update metadata with official sales/unit data
        metrics = metrics || '{
            "totalUnits": 332,
            "unitsBooked": 209,
            "unitsSold": 59,
            "latestOfficialReraRecord": "38.42% (05-Jun-2025)"
        }'::jsonb,
        updated_at = NOW()
    WHERE id = v_project_id OR slug = 'gardenia-floors';
END $$;
