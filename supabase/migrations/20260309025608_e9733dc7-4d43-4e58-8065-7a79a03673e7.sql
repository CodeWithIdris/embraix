
-- Research submissions table
CREATE TABLE public.research_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  author_name text NOT NULL,
  institution text,
  email text NOT NULL,
  category text NOT NULL,
  abstract text NOT NULL,
  tags text[] DEFAULT '{}',
  file_url text,
  file_name text,
  file_type text,
  supporting_images text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.research_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view own submissions
CREATE POLICY "Users can view own submissions" ON public.research_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions" ON public.research_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update own pending submissions
CREATE POLICY "Users can update own pending submissions" ON public.research_submissions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');

-- Anyone can view published submissions
CREATE POLICY "Anyone can view published submissions" ON public.research_submissions
  FOR SELECT USING (status = 'approved');

-- Admins can manage all
CREATE POLICY "Admins can manage all research" ON public.research_submissions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for research files
INSERT INTO storage.buckets (id, name, public) VALUES ('research-files', 'research-files', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload research files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'research-files');

CREATE POLICY "Anyone can view research files" ON storage.objects
  FOR SELECT USING (bucket_id = 'research-files');

CREATE POLICY "Users can delete own research files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'research-files' AND (storage.foldername(name))[1] = auth.uid()::text);
