
-- =====================================================================
-- BUILD-017 — Decision Intelligence Layer
-- =====================================================================

-- ---------- Extend roles (additive, non-breaking) ----------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'editor' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'editor';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'reviewer' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'reviewer';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'publisher' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'publisher';
  END IF;
END $$;

-- ---------- Shared helpers ----------
CREATE OR REPLACE FUNCTION public.di_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Convenience role checks (composed on top of has_role)
CREATE OR REPLACE FUNCTION public.di_can_edit(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role::text IN ('admin','moderator','editor','reviewer','publisher')
  );
$$;

CREATE OR REPLACE FUNCTION public.di_can_review(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role::text IN ('admin','moderator','reviewer','publisher')
  );
$$;

CREATE OR REPLACE FUNCTION public.di_can_publish(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _uid
      AND role::text IN ('admin','publisher')
  );
$$;

-- ---------- audit_logs (governance) ----------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name TEXT NOT NULL,
  row_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_row ON public.audit_logs(row_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin_read" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.di_audit_row()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _row_id UUID;
  _old JSONB;
  _new JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _new := to_jsonb(NEW); _row_id := (NEW).id;
  ELSIF TG_OP = 'UPDATE' THEN
    _old := to_jsonb(OLD); _new := to_jsonb(NEW); _row_id := (NEW).id;
  ELSE
    _old := to_jsonb(OLD); _row_id := (OLD).id;
  END IF;
  INSERT INTO public.audit_logs(actor_id, action, table_name, row_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, _row_id, _old, _new);
  RETURN COALESCE(NEW, OLD);
END; $$;

-- ---------- decision_entities ----------
CREATE TABLE IF NOT EXISTS public.decision_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('place','builder','project','school','hospital','infrastructure')),
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_de_entity_type ON public.decision_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_de_entity_id ON public.decision_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_de_status ON public.decision_entities(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_entities TO authenticated;
GRANT SELECT ON public.decision_entities TO anon;
GRANT ALL ON public.decision_entities TO service_role;
ALTER TABLE public.decision_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "de_public_read_published" ON public.decision_entities FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "de_staff_read_all" ON public.decision_entities FOR SELECT TO authenticated
  USING (public.di_can_edit(auth.uid()));
CREATE POLICY "de_editor_insert" ON public.decision_entities FOR INSERT TO authenticated
  WITH CHECK (public.di_can_edit(auth.uid()) AND status IN ('draft','review'));
CREATE POLICY "de_editor_update_nonpublish" ON public.decision_entities FOR UPDATE TO authenticated
  USING (public.di_can_edit(auth.uid()))
  WITH CHECK (
    (status IN ('draft','review') AND public.di_can_edit(auth.uid()))
    OR (status IN ('published','archived') AND public.di_can_publish(auth.uid()))
  );
CREATE POLICY "de_admin_delete" ON public.decision_entities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_de_touch BEFORE UPDATE ON public.decision_entities
  FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_de_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_entities
  FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- Helper: is a decision_entity (by id) published?
CREATE OR REPLACE FUNCTION public.di_entity_published(_decision_entity_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.decision_entities WHERE id = _decision_entity_id AND status = 'published');
$$;

-- ---------- decision_dimensions ----------
CREATE TABLE IF NOT EXISTS public.decision_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  weight_default NUMERIC(6,3) NOT NULL DEFAULT 1,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dd_active ON public.decision_dimensions(is_active);

GRANT SELECT ON public.decision_dimensions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_dimensions TO authenticated;
GRANT ALL ON public.decision_dimensions TO service_role;
ALTER TABLE public.decision_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dd_public_read_active" ON public.decision_dimensions FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "dd_staff_read_all" ON public.decision_dimensions FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "dd_admin_write" ON public.decision_dimensions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dd_touch BEFORE UPDATE ON public.decision_dimensions FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_dd_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_dimensions FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- Seed core dimensions
INSERT INTO public.decision_dimensions(code,name,description,display_order,weight_default,icon,color) VALUES
  ('builder_trust','Builder Trust','Track record, delivery, transparency',1,1.0,'shield-check','#0F172A'),
  ('growth','Growth Potential','Appreciation and demand outlook',2,1.0,'trending-up','#16A34A'),
  ('market','Market Health','Absorption, pricing, liquidity',3,1.0,'line-chart','#C89B3C'),
  ('livability','Livability','Lifestyle and everyday quality',4,1.0,'home','#0EA5E9'),
  ('risk','Risk','Legal, financial, environmental risk',5,1.0,'alert-triangle','#DC2626'),
  ('connectivity','Connectivity','Roads, transit, airport access',6,1.0,'route','#6366F1'),
  ('education','Education','Schools and higher education access',7,1.0,'graduation-cap','#0EA5E9'),
  ('healthcare','Healthcare','Hospitals and medical infrastructure',8,1.0,'hospital','#DC2626'),
  ('infrastructure','Infrastructure','Utilities, master plans, public works',9,1.0,'building-2','#0F172A'),
  ('environment','Environment','Green cover, pollution, climate',10,1.0,'leaf','#16A34A')
ON CONFLICT (code) DO NOTHING;

-- ---------- decision_scores ----------
CREATE TABLE IF NOT EXISTS public.decision_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_entity_id UUID NOT NULL REFERENCES public.decision_entities(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES public.decision_dimensions(id) ON DELETE RESTRICT,
  score NUMERIC(6,2) NOT NULL,
  max_score NUMERIC(6,2) NOT NULL DEFAULT 10,
  weight NUMERIC(6,3) NOT NULL DEFAULT 1,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  calculation_version TEXT NOT NULL DEFAULT 'v1',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calculated_by UUID,
  reason_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (decision_entity_id, dimension_id)
);
CREATE INDEX IF NOT EXISTS idx_ds_entity ON public.decision_scores(decision_entity_id);
CREATE INDEX IF NOT EXISTS idx_ds_dimension ON public.decision_scores(dimension_id);

GRANT SELECT ON public.decision_scores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_scores TO authenticated;
GRANT ALL ON public.decision_scores TO service_role;
ALTER TABLE public.decision_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ds_public_read_published" ON public.decision_scores FOR SELECT TO anon, authenticated
  USING (public.di_entity_published(decision_entity_id));
CREATE POLICY "ds_staff_read_all" ON public.decision_scores FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "ds_editor_write" ON public.decision_scores FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_ds_touch BEFORE UPDATE ON public.decision_scores FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_ds_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_scores FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- decision_factors ----------
CREATE TABLE IF NOT EXISTS public.decision_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_score_id UUID NOT NULL REFERENCES public.decision_scores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('positive','negative','neutral')),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 10),
  evidence_count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_df_score ON public.decision_factors(decision_score_id);

GRANT SELECT ON public.decision_factors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_factors TO authenticated;
GRANT ALL ON public.decision_factors TO service_role;
ALTER TABLE public.decision_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "df_public_read_published" ON public.decision_factors FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.decision_scores s WHERE s.id = decision_score_id AND public.di_entity_published(s.decision_entity_id)));
CREATE POLICY "df_staff_read_all" ON public.decision_factors FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "df_editor_write" ON public.decision_factors FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_df_touch BEFORE UPDATE ON public.decision_factors FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_df_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_factors FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- decision_evidence ----------
CREATE TABLE IF NOT EXISTS public.decision_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_factor_id UUID NOT NULL REFERENCES public.decision_factors(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('government','rera','builder','inspection','media','research','external')),
  source_title TEXT NOT NULL,
  source_url TEXT,
  media_asset_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
  published_date DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('verified','pending','rejected')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dev_factor ON public.decision_evidence(decision_factor_id);
CREATE INDEX IF NOT EXISTS idx_dev_status ON public.decision_evidence(verification_status);

GRANT SELECT ON public.decision_evidence TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_evidence TO authenticated;
GRANT ALL ON public.decision_evidence TO service_role;
ALTER TABLE public.decision_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev_public_read_verified_published" ON public.decision_evidence FOR SELECT TO anon, authenticated
  USING (
    verification_status = 'verified'
    AND EXISTS (
      SELECT 1 FROM public.decision_factors f
      JOIN public.decision_scores s ON s.id = f.decision_score_id
      WHERE f.id = decision_factor_id AND public.di_entity_published(s.decision_entity_id)
    )
  );
CREATE POLICY "dev_staff_read_all" ON public.decision_evidence FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "dev_editor_insert" ON public.decision_evidence FOR INSERT TO authenticated
  WITH CHECK (public.di_can_edit(auth.uid()));
CREATE POLICY "dev_editor_update" ON public.decision_evidence FOR UPDATE TO authenticated
  USING (public.di_can_edit(auth.uid()))
  WITH CHECK (
    public.di_can_edit(auth.uid())
    AND (verification_status = 'pending' OR public.di_can_review(auth.uid()))
  );
CREATE POLICY "dev_admin_delete" ON public.decision_evidence FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_dev_touch BEFORE UPDATE ON public.decision_evidence FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_dev_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_evidence FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- decision_recommendations ----------
CREATE TABLE IF NOT EXISTS public.decision_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_entity_id UUID NOT NULL REFERENCES public.decision_entities(id) ON DELETE CASCADE,
  persona TEXT NOT NULL CHECK (persona IN ('family','investor','luxury','student','nri','retiree')),
  recommendation TEXT NOT NULL CHECK (recommendation IN ('recommended','consider','avoid')),
  summary TEXT,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  cons JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (decision_entity_id, persona)
);
CREATE INDEX IF NOT EXISTS idx_dr_entity ON public.decision_recommendations(decision_entity_id);

GRANT SELECT ON public.decision_recommendations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_recommendations TO authenticated;
GRANT ALL ON public.decision_recommendations TO service_role;
ALTER TABLE public.decision_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dr_public_read_published" ON public.decision_recommendations FOR SELECT TO anon, authenticated
  USING (public.di_entity_published(decision_entity_id));
CREATE POLICY "dr_staff_read_all" ON public.decision_recommendations FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "dr_editor_write" ON public.decision_recommendations FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_dr_touch BEFORE UPDATE ON public.decision_recommendations FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_dr_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_recommendations FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- decision_insights ----------
CREATE TABLE IF NOT EXISTS public.decision_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_entity_id UUID NOT NULL REFERENCES public.decision_entities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  details TEXT,
  category TEXT NOT NULL CHECK (category IN ('market','growth','risk','builder','place','project')),
  priority INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_di_entity ON public.decision_insights(decision_entity_id);
CREATE INDEX IF NOT EXISTS idx_di_featured ON public.decision_insights(is_featured);

GRANT SELECT ON public.decision_insights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_insights TO authenticated;
GRANT ALL ON public.decision_insights TO service_role;
ALTER TABLE public.decision_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "din_public_read_published" ON public.decision_insights FOR SELECT TO anon, authenticated
  USING (public.di_entity_published(decision_entity_id));
CREATE POLICY "din_staff_read_all" ON public.decision_insights FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "din_editor_write" ON public.decision_insights FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_din_touch BEFORE UPDATE ON public.decision_insights FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_din_audit AFTER INSERT OR UPDATE OR DELETE ON public.decision_insights FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- promise_ledgers ----------
CREATE TABLE IF NOT EXISTS public.promise_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('place','builder','project','school','hospital','infrastructure')),
  entity_id UUID NOT NULL,
  promise TEXT NOT NULL,
  category TEXT,
  announced_by TEXT,
  announcement_date DATE,
  expected_completion DATE,
  actual_completion DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','progress','completed','delayed','cancelled')),
  evidence_count INTEGER NOT NULL DEFAULT 0,
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low','medium','high')),
  last_verified TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pl_entity ON public.promise_ledgers(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pl_status ON public.promise_ledgers(status);

GRANT SELECT ON public.promise_ledgers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promise_ledgers TO authenticated;
GRANT ALL ON public.promise_ledgers TO service_role;
ALTER TABLE public.promise_ledgers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pl_public_read_published" ON public.promise_ledgers FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.decision_entities de WHERE de.entity_type = promise_ledgers.entity_type AND de.entity_id = promise_ledgers.entity_id AND de.status = 'published'));
CREATE POLICY "pl_staff_read_all" ON public.promise_ledgers FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "pl_editor_write" ON public.promise_ledgers FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_pl_touch BEFORE UPDATE ON public.promise_ledgers FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_pl_audit AFTER INSERT OR UPDATE OR DELETE ON public.promise_ledgers FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();

-- ---------- entity_risks ----------
CREATE TABLE IF NOT EXISTS public.entity_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('place','builder','project','school','hospital','infrastructure')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  probability TEXT NOT NULL CHECK (probability IN ('low','medium','high')),
  description TEXT,
  mitigation TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','monitoring')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_er_entity ON public.entity_risks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_er_severity ON public.entity_risks(severity);

GRANT SELECT ON public.entity_risks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entity_risks TO authenticated;
GRANT ALL ON public.entity_risks TO service_role;
ALTER TABLE public.entity_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "er_public_read_published" ON public.entity_risks FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.decision_entities de WHERE de.entity_type = entity_risks.entity_type AND de.entity_id = entity_risks.entity_id AND de.status = 'published'));
CREATE POLICY "er_staff_read_all" ON public.entity_risks FOR SELECT TO authenticated USING (public.di_can_edit(auth.uid()));
CREATE POLICY "er_editor_write" ON public.entity_risks FOR ALL TO authenticated
  USING (public.di_can_edit(auth.uid())) WITH CHECK (public.di_can_edit(auth.uid()));

CREATE TRIGGER trg_er_touch BEFORE UPDATE ON public.entity_risks FOR EACH ROW EXECUTE FUNCTION public.di_touch_updated_at();
CREATE TRIGGER trg_er_audit AFTER INSERT OR UPDATE OR DELETE ON public.entity_risks FOR EACH ROW EXECUTE FUNCTION public.di_audit_row();
