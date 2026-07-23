
-- Extend projects table for enterprise CMS (BUILD-012)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS publish_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS executive_summary text,
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS construction_status text,
  ADD COLUMN IF NOT EXISTS completion_percentage integer,
  ADD COLUMN IF NOT EXISTS starting_price numeric,
  ADD COLUMN IF NOT EXISTS max_price numeric,
  ADD COLUMN IF NOT EXISTS price_per_sqft numeric,
  ADD COLUMN IF NOT EXISTS booking_amount numeric,
  ADD COLUMN IF NOT EXISTS maintenance_charges text,
  ADD COLUMN IF NOT EXISTS launch_date date,
  ADD COLUMN IF NOT EXISTS completion_date date,
  ADD COLUMN IF NOT EXISTS possession_date date,
  ADD COLUMN IF NOT EXISTS rera_number text,
  ADD COLUMN IF NOT EXISTS rera jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS unit_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS nearby jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS investment jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.projects ALTER COLUMN summary SET DEFAULT '';
ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'planning';

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON public.projects(slug);
CREATE INDEX IF NOT EXISTS projects_builder_id_idx ON public.projects(builder_id);
CREATE INDEX IF NOT EXISTS projects_place_id_idx ON public.projects(place_id);
CREATE INDEX IF NOT EXISTS projects_publish_status_idx ON public.projects(publish_status);

-- Grants (were missing)
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

-- Tighten policies: public sees only published; admins can manage
DROP POLICY IF EXISTS "Projects are publicly readable" ON public.projects;

CREATE POLICY "Published projects are publicly readable"
  ON public.projects FOR SELECT
  USING (publish_status = 'published');

CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
