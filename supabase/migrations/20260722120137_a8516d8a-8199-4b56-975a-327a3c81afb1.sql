
-- 1. Role enum + user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. has_role security-definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Bootstrap function: first authenticated caller becomes admin if none exists
CREATE OR REPLACE FUNCTION public.bootstrap_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Must be signed in';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin() TO authenticated;

-- 4. Replace TEMP open policies with admin-scoped policies

-- places
DROP POLICY IF EXISTS "All places readable by admins (temp open)" ON public.places;
DROP POLICY IF EXISTS "TEMP admin insert places" ON public.places;
DROP POLICY IF EXISTS "TEMP admin update places" ON public.places;
DROP POLICY IF EXISTS "TEMP admin delete places" ON public.places;

CREATE POLICY "Admins can read all places"
  ON public.places FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert places"
  ON public.places FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update places"
  ON public.places FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete places"
  ON public.places FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- entity_images
DROP POLICY IF EXISTS "TEMP admin write entity_images ins" ON public.entity_images;
DROP POLICY IF EXISTS "TEMP admin write entity_images upd" ON public.entity_images;
DROP POLICY IF EXISTS "TEMP admin write entity_images del" ON public.entity_images;
CREATE POLICY "Admins can insert entity_images"
  ON public.entity_images FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update entity_images"
  ON public.entity_images FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete entity_images"
  ON public.entity_images FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- entity_documents
DROP POLICY IF EXISTS "TEMP admin write entity_documents ins" ON public.entity_documents;
DROP POLICY IF EXISTS "TEMP admin write entity_documents upd" ON public.entity_documents;
DROP POLICY IF EXISTS "TEMP admin write entity_documents del" ON public.entity_documents;
CREATE POLICY "Admins can insert entity_documents"
  ON public.entity_documents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update entity_documents"
  ON public.entity_documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete entity_documents"
  ON public.entity_documents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- entity_scores
DROP POLICY IF EXISTS "TEMP admin write entity_scores ins" ON public.entity_scores;
DROP POLICY IF EXISTS "TEMP admin write entity_scores upd" ON public.entity_scores;
DROP POLICY IF EXISTS "TEMP admin write entity_scores del" ON public.entity_scores;
CREATE POLICY "Admins can insert entity_scores"
  ON public.entity_scores FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update entity_scores"
  ON public.entity_scores FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete entity_scores"
  ON public.entity_scores FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- storage: entity-media bucket
DROP POLICY IF EXISTS "entity-media temp admin insert" ON storage.objects;
DROP POLICY IF EXISTS "entity-media temp admin update" ON storage.objects;
DROP POLICY IF EXISTS "entity-media temp admin delete" ON storage.objects;
CREATE POLICY "entity-media admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'entity-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "entity-media admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'entity-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'entity-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "entity-media admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'entity-media' AND public.has_role(auth.uid(), 'admin'));
