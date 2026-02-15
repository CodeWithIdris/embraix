
-- Fix 1: Add admin INSERT/DELETE policies for user_roles
CREATE POLICY "Admins can grant roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can revoke roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND NOT (
    role = 'admin' AND 
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') = 1
  )
);

-- Fix 2: Sanitize handle_new_user trigger to prevent metadata injection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  safe_full_name TEXT;
BEGIN
  -- Sanitize full_name: limit length and strip dangerous characters
  safe_full_name := SUBSTRING(
    REGEXP_REPLACE(
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
      '[<>"''%;()&+]',
      '',
      'g'
    ),
    1,
    255
  );
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(TRIM(safe_full_name), ''));
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Fix 3: Restrict service_providers to require authentication for viewing contact details
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active providers" ON public.service_providers;

-- Replace with authenticated-only access
CREATE POLICY "Authenticated users can view active providers"
ON public.service_providers FOR SELECT
TO authenticated
USING (status = 'active'::provider_status);
