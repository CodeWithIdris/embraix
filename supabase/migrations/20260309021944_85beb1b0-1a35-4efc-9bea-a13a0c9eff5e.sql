
-- Installers table
CREATE TABLE public.installers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  location text,
  city text,
  country text DEFAULT 'Nigeria',
  specializations text[] NOT NULL DEFAULT '{}',
  years_experience integer,
  certifications text[],
  portfolio_images text[],
  bio text,
  status text NOT NULL DEFAULT 'pending',
  availability_status text NOT NULL DEFAULT 'available',
  assigned_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

ALTER TABLE public.installers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active installers (for assignment logic)
CREATE POLICY "Admins can manage all installers" ON public.installers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own installer profile" ON public.installers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Installers can view own profile" ON public.installers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Installers can update own profile" ON public.installers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Add assigned_installer_id to service_requests
ALTER TABLE public.service_requests ADD COLUMN assigned_installer_id uuid REFERENCES public.installers(id);

-- Function to auto-assign installer
CREATE OR REPLACE FUNCTION public.auto_assign_installer(p_request_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_installer_id uuid;
  v_service_type text;
  v_location text;
BEGIN
  SELECT service_type, location INTO v_service_type, v_location
  FROM service_requests WHERE id = p_request_id;

  -- Find available approved installer matching specialization, prefer same location
  SELECT id INTO v_installer_id
  FROM installers
  WHERE status = 'approved'
    AND availability_status = 'available'
    AND (
      specializations && ARRAY[v_service_type]
      OR array_length(specializations, 1) IS NULL
    )
  ORDER BY
    CASE WHEN location ILIKE '%' || COALESCE(v_location, '') || '%' THEN 0 ELSE 1 END,
    assigned_count ASC,
    created_at ASC
  LIMIT 1;

  IF v_installer_id IS NOT NULL THEN
    UPDATE service_requests
    SET assigned_installer_id = v_installer_id, status = 'assigned'
    WHERE id = p_request_id;

    UPDATE installers
    SET assigned_count = assigned_count + 1, availability_status = 'busy'
    WHERE id = v_installer_id;
  END IF;

  RETURN v_installer_id;
END;
$$;
