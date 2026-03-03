
-- Create expert_documents table for certification/document uploads
CREATE TABLE public.expert_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.expert_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_name text NOT NULL,
  file_size integer,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Add new columns to expert_applications
ALTER TABLE public.expert_applications
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS linkedin text,
  ADD COLUMN IF NOT EXISTS portfolio text;

-- Enable RLS
ALTER TABLE public.expert_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for expert_documents
CREATE POLICY "Users can upload own documents"
  ON public.expert_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own documents"
  ON public.expert_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all documents"
  ON public.expert_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for expert documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-documents', 'expert-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload expert documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'expert-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own expert documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expert-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all expert documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expert-documents' AND public.has_role(auth.uid(), 'admin'));
