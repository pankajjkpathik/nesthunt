
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric;

CREATE INDEX IF NOT EXISTS places_state_idx ON public.places (state);
CREATE INDEX IF NOT EXISTS places_city_idx ON public.places (city);
CREATE INDEX IF NOT EXISTS places_status_idx ON public.places (status);
