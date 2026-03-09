-- Create service_requests table
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  service_type TEXT NOT NULL,
  project_size TEXT,
  description TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_expert_id UUID REFERENCES public.expert_profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a service request (even unauthenticated for broader reach)
CREATE POLICY "Anyone can create service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (true);

-- Users can view own requests
CREATE POLICY "Users can view own service requests"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own pending requests
CREATE POLICY "Users can update own pending requests"
  ON public.service_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all requests
CREATE POLICY "Admins can manage all service requests"
  ON public.service_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Assigned experts can view their requests
CREATE POLICY "Experts can view assigned requests"
  ON public.service_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.expert_profiles 
    WHERE id = assigned_expert_id AND user_id = auth.uid()
  ));

-- Add updated_at trigger
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for service request files
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-request-files', 'service-request-files', true);

-- Storage policies for service request files
CREATE POLICY "Anyone can upload service request files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-request-files');

CREATE POLICY "Anyone can view service request files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-request-files');