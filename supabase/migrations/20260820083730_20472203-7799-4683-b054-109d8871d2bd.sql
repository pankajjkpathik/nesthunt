UPDATE public.projects 
SET place_id = 'e8576d1b-849a-45e9-a190-3b964b41c6c7'
WHERE id IN ('97e4f7fb-1e51-492c-8968-bd3101eaae94', '010b1055-f19a-4711-bc94-518295bcfd73')
  AND place_id IS NULL;