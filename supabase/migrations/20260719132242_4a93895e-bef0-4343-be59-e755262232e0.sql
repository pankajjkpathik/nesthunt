-- Extend places for admin CMS
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS lifestyle text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS healthcare text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS growth_drivers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.places DROP CONSTRAINT IF EXISTS places_status_check;
ALTER TABLE public.places ADD CONSTRAINT places_status_check
  CHECK (status IN ('draft','review','published'));

-- Backfill existing rows to published so the live pages don't disappear.
UPDATE public.places SET status = 'published' WHERE status = 'draft';

-- Only expose published rows to anonymous readers on the public site.
DROP POLICY IF EXISTS "Places are publicly readable" ON public.places;
CREATE POLICY "Published places are publicly readable" ON public.places
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "All places readable by admins (temp open)" ON public.places
  FOR SELECT TO anon, authenticated USING (true);

-- TEMPORARY: admin CMS has no auth yet. Allow anon writes so the editor works
-- against the current backend. REPLACE with role-scoped policies once
-- admin authentication is wired.
CREATE POLICY "TEMP admin insert places" ON public.places
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "TEMP admin update places" ON public.places
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "TEMP admin delete places" ON public.places
  FOR DELETE TO anon, authenticated USING (true);

GRANT INSERT, UPDATE, DELETE ON public.places TO anon, authenticated;

-- updated_at trigger
DROP TRIGGER IF EXISTS places_set_updated_at ON public.places;
CREATE TRIGGER places_set_updated_at BEFORE UPDATE ON public.places
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- entity_images / entity_documents / entity_scores — TEMP admin writes
CREATE POLICY "TEMP admin write entity_images ins" ON public.entity_images
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_images upd" ON public.entity_images
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_images del" ON public.entity_images
  FOR DELETE TO anon, authenticated USING (true);
GRANT INSERT, UPDATE, DELETE ON public.entity_images TO anon, authenticated;

CREATE POLICY "TEMP admin write entity_documents ins" ON public.entity_documents
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_documents upd" ON public.entity_documents
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_documents del" ON public.entity_documents
  FOR DELETE TO anon, authenticated USING (true);
GRANT INSERT, UPDATE, DELETE ON public.entity_documents TO anon, authenticated;

CREATE POLICY "TEMP admin write entity_scores ins" ON public.entity_scores
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_scores upd" ON public.entity_scores
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "TEMP admin write entity_scores del" ON public.entity_scores
  FOR DELETE TO anon, authenticated USING (true);
GRANT INSERT, UPDATE, DELETE ON public.entity_scores TO anon, authenticated;