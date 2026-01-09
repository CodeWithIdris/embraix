-- Create projects table for admin project management
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view published projects
CREATE POLICY "Anyone can view published projects"
ON public.projects FOR SELECT
USING (status = 'published');

-- Writers/Admins can manage projects
CREATE POLICY "Writers can manage projects"
ON public.projects FOR ALL
USING (is_admin_or_writer(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create project_files table for file attachments
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Anyone can view files for published projects
CREATE POLICY "Anyone can view published project files"
ON public.project_files FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = project_files.project_id
  AND projects.status = 'published'
));

-- Writers can manage project files
CREATE POLICY "Writers can manage project files"
ON public.project_files FOR ALL
USING (is_admin_or_writer(auth.uid()));

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project files
CREATE POLICY "Anyone can view project files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

CREATE POLICY "Writers can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-files' AND is_admin_or_writer(auth.uid()));

CREATE POLICY "Writers can update project files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-files' AND is_admin_or_writer(auth.uid()));

CREATE POLICY "Writers can delete project files"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-files' AND is_admin_or_writer(auth.uid()));

-- Enable realtime for consultation_tickets if not already
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;