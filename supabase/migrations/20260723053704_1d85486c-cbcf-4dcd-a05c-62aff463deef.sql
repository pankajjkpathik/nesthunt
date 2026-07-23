
-- Extend builders table with enterprise CMS fields
ALTER TABLE public.builders
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS builder_type text NOT NULL DEFAULT 'Developer',
  ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS year_established integer,
  ADD COLUMN IF NOT EXISTS head_office text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pan text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gst text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS company_registration text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS organization_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS employee_count text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS trust_score numeric,
  ADD COLUMN IF NOT EXISTS trust_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS leadership jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rera jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS awards jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS builders_status_idx ON public.builders (status);
CREATE INDEX IF NOT EXISTS builders_state_idx ON public.builders (state);
CREATE INDEX IF NOT EXISTS builders_city_idx ON public.builders (city);
CREATE INDEX IF NOT EXISTS builders_verified_idx ON public.builders (verified);

-- Builder <-> Place join table (many-to-many)
CREATE TABLE IF NOT EXISTS public.builder_places (
  builder_id uuid NOT NULL REFERENCES public.builders(id) ON DELETE CASCADE,
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (builder_id, place_id)
);

GRANT SELECT ON public.builder_places TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_places TO authenticated;
GRANT ALL ON public.builder_places TO service_role;

ALTER TABLE public.builder_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read builder_places"
  ON public.builder_places FOR SELECT
  USING (true);

CREATE POLICY "Admins manage builder_places"
  ON public.builder_places FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS builder_places_place_idx ON public.builder_places (place_id);
