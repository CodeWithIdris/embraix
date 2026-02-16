
-- Expert applications table for self-registration
CREATE TABLE public.expert_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  experience_summary TEXT NOT NULL,
  qualifications TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;

-- Users can create their own application
CREATE POLICY "Users can create own application"
ON public.expert_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view own application
CREATE POLICY "Users can view own application"
ON public.expert_applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update own pending application
CREATE POLICY "Users can update own pending application"
ON public.expert_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON public.expert_applications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to auto-assign expert with fewest active chats
CREATE OR REPLACE FUNCTION public.auto_assign_expert(p_chat_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expert_id UUID;
BEGIN
  -- Find expert with fewest active chats
  SELECT ur.user_id INTO v_expert_id
  FROM user_roles ur
  WHERE ur.role = 'expert'
  AND ur.user_id != (SELECT client_id FROM expert_chats WHERE id = p_chat_id)
  ORDER BY (
    SELECT COUNT(*) FROM expert_chats ec 
    WHERE ec.expert_id = ur.user_id AND ec.status = 'active'
  ) ASC
  LIMIT 1;

  IF v_expert_id IS NOT NULL THEN
    UPDATE expert_chats
    SET expert_id = v_expert_id, status = 'active', updated_at = now()
    WHERE id = p_chat_id AND status = 'waiting';
  END IF;

  RETURN v_expert_id;
END;
$$;

-- Enable realtime for expert_applications
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_applications;
