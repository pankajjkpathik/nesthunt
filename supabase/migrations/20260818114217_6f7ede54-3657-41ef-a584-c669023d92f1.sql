-- GARDENIA FLOORS PUBLIC LAUNCH
-- Project UUID: ccbc4389-78f2-4855-b6b6-5e5c82b42576

UPDATE public.projects
SET 
    publish_status = 'published',
    updated_at = NOW()
WHERE id = 'ccbc4389-78f2-4855-b6b6-5e5c82b42576'
  AND publish_status = 'draft';
