
-- =============== CATEGORIES ===============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  description text,
  icon text,
  featured_image_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_status ON public.categories(status);

-- =============== AMENITIES ===============
CREATE TABLE public.amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'lifestyle',
  description text,
  icon text,
  illustration_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.amenities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.amenities TO authenticated;
GRANT ALL ON public.amenities TO service_role;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amenities public read" ON public.amenities FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "amenities admin write" ON public.amenities FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_amenities_updated BEFORE UPDATE ON public.amenities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_amenities_category ON public.amenities(category);
CREATE INDEX idx_amenities_status ON public.amenities(status);

-- =============== INFRASTRUCTURE ITEMS ===============
CREATE TABLE public.infrastructure_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'other',
  description text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  address text,
  city text,
  state text,
  website text,
  phone text,
  hours text,
  image_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.infrastructure_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.infrastructure_items TO authenticated;
GRANT ALL ON public.infrastructure_items TO service_role;
ALTER TABLE public.infrastructure_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "infra public read" ON public.infrastructure_items FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "infra admin write" ON public.infrastructure_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_infra_updated BEFORE UPDATE ON public.infrastructure_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_infra_category ON public.infrastructure_items(category);
CREATE INDEX idx_infra_city ON public.infrastructure_items(city);

-- =============== UNIT TYPES ===============
CREATE TABLE public.unit_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'residential',
  bedrooms integer,
  bathrooms integer,
  balconies integer,
  super_area_min numeric(10,2),
  super_area_max numeric(10,2),
  carpet_area_min numeric(10,2),
  carpet_area_max numeric(10,2),
  facing text,
  floor_plan_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.unit_types TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_types TO authenticated;
GRANT ALL ON public.unit_types TO service_role;
ALTER TABLE public.unit_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "unit_types public read" ON public.unit_types FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "unit_types admin write" ON public.unit_types FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_unit_types_updated BEFORE UPDATE ON public.unit_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_unit_types_category ON public.unit_types(category);

-- =============== INFRASTRUCTURE LINKS ===============
CREATE TABLE public.infrastructure_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  infrastructure_id uuid NOT NULL REFERENCES public.infrastructure_items(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('place','project')),
  entity_id uuid NOT NULL,
  distance_km numeric(6,2),
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (infrastructure_id, entity_type, entity_id)
);
GRANT SELECT ON public.infrastructure_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.infrastructure_links TO authenticated;
GRANT ALL ON public.infrastructure_links TO service_role;
ALTER TABLE public.infrastructure_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "infra_links public read" ON public.infrastructure_links FOR SELECT USING (true);
CREATE POLICY "infra_links admin write" ON public.infrastructure_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_infra_links_updated BEFORE UPDATE ON public.infrastructure_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_infra_links_entity ON public.infrastructure_links(entity_type, entity_id);
CREATE INDEX idx_infra_links_infra ON public.infrastructure_links(infrastructure_id);

-- =============== HEALTH RPCs ===============
CREATE OR REPLACE FUNCTION public.content_unused_categories()
RETURNS TABLE(id uuid, name text, slug text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT c.id, c.name, c.slug FROM public.categories c
  LEFT JOIN public.entity_relationships r
    ON r.to_type = 'category' AND r.to_id = c.id
  WHERE r.id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.content_unused_amenities()
RETURNS TABLE(id uuid, name text, slug text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT a.id, a.name, a.slug FROM public.amenities a
  LEFT JOIN public.entity_relationships r
    ON r.to_type = 'amenity' AND r.to_id = a.id
  WHERE r.id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.content_unused_infrastructure()
RETURNS TABLE(id uuid, name text, slug text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT i.id, i.name, i.slug FROM public.infrastructure_items i
  LEFT JOIN public.infrastructure_links l ON l.infrastructure_id = i.id
  WHERE l.id IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.content_unused_unit_types()
RETURNS TABLE(id uuid, name text, slug text)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT u.id, u.name, u.slug FROM public.unit_types u
  LEFT JOIN public.entity_relationships r
    ON r.to_type = 'unit_type' AND r.to_id = u.id
  WHERE r.id IS NULL;
$$;
