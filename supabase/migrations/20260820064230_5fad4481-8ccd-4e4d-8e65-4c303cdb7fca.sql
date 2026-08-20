-- Add RLS policies for project_governance and project_exceptions
CREATE POLICY "Admins can manage project_governance"
ON public.project_governance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage project_exceptions"
ON public.project_exceptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
