-- Create expert profiles table from approved applications
CREATE TABLE public.expert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  application_id UUID REFERENCES public.expert_applications(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  professional_title TEXT,
  expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  bio TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Nigeria',
  languages TEXT[] DEFAULT ARRAY['English'],
  linkedin TEXT,
  portfolio TEXT,
  avatar_url TEXT,
  hourly_rate TEXT,
  is_available BOOLEAN DEFAULT true,
  badges TEXT[] DEFAULT '{}',
  certifications TEXT[],
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  consultation_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultation requests table
CREATE TABLE public.consultation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID REFERENCES public.expert_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expert_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- Expert profiles RLS policies
CREATE POLICY "Anyone can view active expert profiles"
  ON public.expert_profiles FOR SELECT
  USING (status = 'active' AND is_available = true);

CREATE POLICY "Experts can view own profile"
  ON public.expert_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can update own profile"
  ON public.expert_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all expert profiles"
  ON public.expert_profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Consultation requests RLS policies
CREATE POLICY "Users can create consultation requests"
  ON public.consultation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own consultation requests"
  ON public.consultation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Experts can view requests to them"
  ON public.consultation_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.expert_profiles 
    WHERE id = expert_id AND user_id = auth.uid()
  ));

CREATE POLICY "Experts can update requests to them"
  ON public.consultation_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.expert_profiles 
    WHERE id = expert_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all consultation requests"
  ON public.consultation_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_expert_profiles_updated_at
  BEFORE UPDATE ON public.expert_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at
  BEFORE UPDATE ON public.consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();