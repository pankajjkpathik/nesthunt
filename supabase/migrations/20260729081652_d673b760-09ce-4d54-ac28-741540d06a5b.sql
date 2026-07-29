
-- =====================================================================
-- PLACE INTELLIGENCE — PHASE 1
-- Extends places + adds place_evidence, place_risks, place_promises
-- =====================================================================

-- Ensure pg_trgm for search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------
-- 1. EXTEND public.places
-- ---------------------------------------------------------------------
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS official_name         text,
  ADD COLUMN IF NOT EXISTS alternate_names       text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS locality_type         text,
  ADD COLUMN IF NOT EXISTS polygon               jsonb,
  ADD COLUMN IF NOT EXISTS pin_codes             text[] NOT NULL DEFAULT '{}',

  ADD COLUMN IF NOT EXISTS market_segment        text,
  ADD COLUMN IF NOT EXISTS development_stage     text,
  ADD COLUMN IF NOT EXISTS investment_category   text,
  ADD COLUMN IF NOT EXISTS lifestyle_tags        text[] NOT NULL DEFAULT '{}',

  ADD COLUMN IF NOT EXISTS average_price         numeric,
  ADD COLUMN IF NOT EXISTS price_min             numeric,
  ADD COLUMN IF NOT EXISTS price_max             numeric,
  ADD COLUMN IF NOT EXISTS rental_yield          numeric,
  ADD COLUMN IF NOT EXISTS absorption_rate       numeric,
  ADD COLUMN IF NOT EXISTS vacancy_rate          numeric,

  ADD COLUMN IF NOT EXISTS connectivity_summary  text,
  ADD COLUMN IF NOT EXISTS employment_summary    text,
  ADD COLUMN IF NOT EXISTS education_summary     text,
  ADD COLUMN IF NOT EXISTS healthcare_summary    text,

  ADD COLUMN IF NOT EXISTS investment_outlook    text,
  ADD COLUMN IF NOT EXISTS livability_outlook    text,
  ADD COLUMN IF NOT EXISTS growth_outlook        text,

  ADD COLUMN IF NOT EXISTS weaknesses            text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recommendation        text;

-- Search indexes (trigram) — extend admin/public search
CREATE INDEX IF NOT EXISTS idx_places_official_name_trgm
  ON public.places USING gin (coalesce(official_name,'') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_slug_trgm
  ON public.places USING gin (slug gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_alternate_names
  ON public.places USING gin (alternate_names);
CREATE INDEX IF NOT EXISTS idx_places_pin_codes
  ON public.places USING gin (pin_codes);
CREATE INDEX IF NOT EXISTS idx_places_lifestyle_tags
  ON public.places USING gin (lifestyle_tags);
CREATE INDEX IF NOT EXISTS idx_places_market_segment
  ON public.places (market_segment);
CREATE INDEX IF NOT EXISTS idx_places_development_stage
  ON public.places (development_stage);

-- ---------------------------------------------------------------------
-- 2. place_evidence
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.place_evidence (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id               uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  title                  text NOT NULL,
  category               text NOT NULL DEFAULT 'general',
  description            text,
  source_name            text,
  source_url             text,
  publication_date       date,
  evidence_type          text NOT NULL DEFAULT 'article',
    -- article | government_notification | rera | master_plan | photo | video | report | other
  confidence_level       text NOT NULL DEFAULT 'medium',
    -- low | medium | high
  verification_status    text NOT NULL DEFAULT 'unverified',
    -- unverified | pending | verified | rejected
  uploaded_document_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  created_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_date            date,
  sort_order             integer NOT NULL DEFAULT 0,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.place_evidence TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_evidence TO authenticated;
GRANT ALL ON public.place_evidence TO service_role;

ALTER TABLE public.place_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_evidence public read of published"
  ON public.place_evidence FOR SELECT TO anon, authenticated
  USING (public.is_entity_published('place', place_id));

CREATE POLICY "place_evidence admin all"
  ON public.place_evidence FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER place_evidence_set_updated_at
  BEFORE UPDATE ON public.place_evidence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_place_evidence_place ON public.place_evidence(place_id);
CREATE INDEX IF NOT EXISTS idx_place_evidence_status ON public.place_evidence(verification_status);
CREATE INDEX IF NOT EXISTS idx_place_evidence_category ON public.place_evidence(category);

-- ---------------------------------------------------------------------
-- 3. place_risks
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.place_risks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id              uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  category              text NOT NULL DEFAULT 'general',
    -- legal | infrastructure | environmental | market | governance | social | general
  severity              text NOT NULL DEFAULT 'medium',
    -- low | medium | high | critical
  probability           text NOT NULL DEFAULT 'medium',
    -- low | medium | high
  description           text,
  mitigation            text,
  evidence_reference    uuid REFERENCES public.place_evidence(id) ON DELETE SET NULL,
  review_cycle          text NOT NULL DEFAULT 'quarterly',
    -- monthly | quarterly | biannual | annual | adhoc
  status                text NOT NULL DEFAULT 'open',
    -- open | monitoring | mitigated | closed
  sort_order            integer NOT NULL DEFAULT 0,
  created_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.place_risks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_risks TO authenticated;
GRANT ALL ON public.place_risks TO service_role;

ALTER TABLE public.place_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_risks public read of published"
  ON public.place_risks FOR SELECT TO anon, authenticated
  USING (public.is_entity_published('place', place_id));

CREATE POLICY "place_risks admin all"
  ON public.place_risks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER place_risks_set_updated_at
  BEFORE UPDATE ON public.place_risks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_place_risks_place ON public.place_risks(place_id);
CREATE INDEX IF NOT EXISTS idx_place_risks_status ON public.place_risks(status);
CREATE INDEX IF NOT EXISTS idx_place_risks_severity ON public.place_risks(severity);

-- ---------------------------------------------------------------------
-- 4. place_promises (Promise Ledger)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.place_promises (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id              uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  promise               text NOT NULL,
  announced_by          text,
  announcement_date     date,
  expected_completion   date,
  current_status        text NOT NULL DEFAULT 'Planned',
    -- Planned | In Progress | Delayed | Completed | Cancelled
  evidence              uuid REFERENCES public.place_evidence(id) ON DELETE SET NULL,
  remarks               text,
  last_verified         date,
  sort_order            integer NOT NULL DEFAULT 0,
  created_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.place_promises TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.place_promises TO authenticated;
GRANT ALL ON public.place_promises TO service_role;

ALTER TABLE public.place_promises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "place_promises public read of published"
  ON public.place_promises FOR SELECT TO anon, authenticated
  USING (public.is_entity_published('place', place_id));

CREATE POLICY "place_promises admin all"
  ON public.place_promises FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER place_promises_set_updated_at
  BEFORE UPDATE ON public.place_promises
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_place_promises_place ON public.place_promises(place_id);
CREATE INDEX IF NOT EXISTS idx_place_promises_status ON public.place_promises(current_status);
