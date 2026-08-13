-- BI-001 Builder Intelligence CMS Foundation

-- 1. Extend builders table
ALTER TABLE public.builders 
ADD COLUMN IF NOT EXISTS legal_name text,
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS operating_years_manual integer,
ADD COLUMN IF NOT EXISTS portfolio_stats_manual jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_stats_manual jsonb DEFAULT '{}'::jsonb;

-- 2. Create child tables
CREATE TABLE IF NOT EXISTS public.builder_leadership (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id uuid REFERENCES public.builders(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    designation text NOT NULL,
    bio text,
    photo_id uuid REFERENCES public.media_assets(id),
    linked_in text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_certifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id uuid REFERENCES public.builders(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    issuer text,
    issue_date date,
    expiry_date date,
    description text,
    media_id uuid REFERENCES public.media_assets(id),
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_awards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id uuid REFERENCES public.builders(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    issuer text,
    year integer,
    description text,
    media_id uuid REFERENCES public.media_assets(id),
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_rera_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id uuid REFERENCES public.builders(id) ON DELETE CASCADE NOT NULL,
    registration_number text NOT NULL,
    state text,
    authority text,
    registration_url text,
    registration_date date,
    expiry_date date,
    status text DEFAULT 'active',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.builder_faqs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id uuid REFERENCES public.builders(id) ON DELETE CASCADE NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    display_order integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. RLS Grants
GRANT SELECT ON public.builder_leadership TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.builder_leadership TO authenticated;
GRANT ALL ON public.builder_leadership TO service_role;

GRANT SELECT ON public.builder_certifications TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.builder_certifications TO authenticated;
GRANT ALL ON public.builder_certifications TO service_role;

GRANT SELECT ON public.builder_awards TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.builder_awards TO authenticated;
GRANT ALL ON public.builder_awards TO service_role;

GRANT SELECT ON public.builder_rera_records TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.builder_rera_records TO authenticated;
GRANT ALL ON public.builder_rera_records TO service_role;

GRANT SELECT ON public.builder_faqs TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.builder_faqs TO authenticated;
GRANT ALL ON public.builder_faqs TO service_role;

-- 4. Enable RLS
ALTER TABLE public.builder_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_rera_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_faqs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_leadership' AND policyname = 'Public read leadership') THEN
        CREATE POLICY "Public read leadership" ON public.builder_leadership FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_certifications' AND policyname = 'Public read certifications') THEN
        CREATE POLICY "Public read certifications" ON public.builder_certifications FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_awards' AND policyname = 'Public read awards') THEN
        CREATE POLICY "Public read awards" ON public.builder_awards FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_rera_records' AND policyname = 'Public read rera') THEN
        CREATE POLICY "Public read rera" ON public.builder_rera_records FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_faqs' AND policyname = 'Public read faqs') THEN
        CREATE POLICY "Public read faqs" ON public.builder_faqs FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_leadership' AND policyname = 'Admins can crud leadership') THEN
        CREATE POLICY "Admins can crud leadership" ON public.builder_leadership FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_certifications' AND policyname = 'Admins can crud certifications') THEN
        CREATE POLICY "Admins can crud certifications" ON public.builder_certifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_awards' AND policyname = 'Admins can crud awards') THEN
        CREATE POLICY "Admins can crud awards" ON public.builder_awards FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_rera_records' AND policyname = 'Admins can crud rera') THEN
        CREATE POLICY "Admins can crud rera" ON public.builder_rera_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'builder_faqs' AND policyname = 'Admins can crud faqs') THEN
        CREATE POLICY "Admins can crud faqs" ON public.builder_faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- 6. Audit Triggers
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'di_audit_row') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_builder_leadership') THEN
            CREATE TRIGGER audit_builder_leadership AFTER INSERT OR UPDATE OR DELETE ON public.builder_leadership FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_builder_certifications') THEN
            CREATE TRIGGER audit_builder_certifications AFTER INSERT OR UPDATE OR DELETE ON public.builder_certifications FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_builder_awards') THEN
            CREATE TRIGGER audit_builder_awards AFTER INSERT OR UPDATE OR DELETE ON public.builder_awards FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_builder_rera_records') THEN
            CREATE TRIGGER audit_builder_rera_records AFTER INSERT OR UPDATE OR DELETE ON public.builder_rera_records FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_builder_faqs') THEN
            CREATE TRIGGER audit_builder_faqs AFTER INSERT OR UPDATE OR DELETE ON public.builder_faqs FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
        END IF;
    END IF;
END $$;

-- 7. Updated At triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_leadership') THEN
        CREATE TRIGGER set_updated_at_leadership BEFORE UPDATE ON public.builder_leadership FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_certifications') THEN
        CREATE TRIGGER set_updated_at_certifications BEFORE UPDATE ON public.builder_certifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_awards') THEN
        CREATE TRIGGER set_updated_at_awards BEFORE UPDATE ON public.builder_awards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_rera') THEN
        CREATE TRIGGER set_updated_at_rera BEFORE UPDATE ON public.builder_rera_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_faqs') THEN
        CREATE TRIGGER set_updated_at_faqs BEFORE UPDATE ON public.builder_faqs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
