-- Add expert reply and file attachment columns to consultation_tickets
ALTER TABLE public.consultation_tickets
ADD COLUMN IF NOT EXISTS expert_reply TEXT,
ADD COLUMN IF NOT EXISTS expert_reply_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS call_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS call_notes TEXT;

-- Create storage bucket for consultation attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('consultation-files', 'consultation-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for consultation files - users can upload their own files
CREATE POLICY "Users can upload consultation files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'consultation-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view own consultation files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'consultation-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all consultation files
CREATE POLICY "Admins can view all consultation files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'consultation-files'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'writer')
  )
);

-- Users can delete their own files
CREATE POLICY "Users can delete own consultation files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'consultation-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);