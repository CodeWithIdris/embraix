
-- Create story type enum
CREATE TYPE public.story_type AS ENUM ('community_story', 'case_study', 'energy_project', 'impact_story');

-- Create case_studies table for Stories & Voices
CREATE TABLE public.case_studies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  story_type story_type NOT NULL DEFAULT 'case_study',
  location TEXT,
  category TEXT,
  excerpt TEXT,
  problem TEXT,
  solution TEXT,
  implementation TEXT,
  impact TEXT,
  content TEXT,
  featured_image TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  video_url TEXT,
  documentation_urls TEXT[] DEFAULT '{}'::TEXT[],
  author_name TEXT,
  organization TEXT,
  project_date DATE,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Anyone can view published case studies
CREATE POLICY "Anyone can view published case studies"
  ON public.case_studies FOR SELECT
  USING (status = 'published');

-- Users can view own submissions
CREATE POLICY "Users can view own case studies"
  ON public.case_studies FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can submit
CREATE POLICY "Users can create case studies"
  ON public.case_studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own pending
CREATE POLICY "Users can update own pending case studies"
  ON public.case_studies FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all
CREATE POLICY "Admins can manage all case studies"
  ON public.case_studies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for case study files
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-study-files', 'case-study-files', true);

-- Storage policies
CREATE POLICY "Anyone can view case study files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-study-files');

CREATE POLICY "Authenticated users can upload case study files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'case-study-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own case study files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'case-study-files' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Seed with sample case studies
INSERT INTO public.case_studies (user_id, title, slug, story_type, location, category, excerpt, problem, solution, implementation, impact, content, featured_image, author_name, organization, project_date, tags, status, published_at) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'Solar-Powered Irrigation Transforms Nigerian Farm',
  'solar-irrigation-kano',
  'case_study',
  'Kano, Nigeria',
  'Agriculture',
  'How a 500-hectare farm eliminated diesel dependency and improved water management through integrated solar pumping systems.',
  'A large-scale farm in Kano relied entirely on diesel generators for irrigation, resulting in high operational costs, frequent fuel shortages, and environmental pollution. The farm was losing 30% of potential yield due to unreliable water supply.',
  'Deployed a 150kW solar-powered irrigation system with smart water management controllers. The system includes 450 solar panels, 3 submersible pumps, and IoT-enabled soil moisture sensors for precision irrigation.',
  'Phase 1 (Months 1-2): Site assessment and system design. Phase 2 (Months 3-4): Solar panel installation and pump integration. Phase 3 (Months 5-6): IoT sensor deployment and system optimization.',
  '40% increase in crop yield within the first harvest season. Complete elimination of diesel costs (saving ₦12M annually). 85% reduction in water waste through precision irrigation. Created 12 permanent technical jobs.',
  'This project demonstrates the transformative potential of solar energy in Nigerian agriculture.',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=500&fit=crop',
  'Dr. Amina Ibrahim',
  'Embraix Energy Solutions',
  '2025-06-15',
  ARRAY['solar', 'agriculture', 'irrigation', 'Nigeria'],
  'published',
  now()
),
(
  '00000000-0000-0000-0000-000000000000',
  'Rural Community Microgrid Powers 500+ Homes',
  'rural-microgrid-ogun',
  'energy_project',
  'Ogun State, Nigeria',
  'Community',
  'Bringing reliable electricity to a previously unconnected rural community through solar microgrids.',
  'Over 500 households in a rural Ogun State community had zero access to grid electricity. Residents relied on kerosene lamps and small generators, spending up to 40% of their income on energy.',
  'Designed and deployed a 200kW solar microgrid with 400kWh battery storage, serving 500+ homes, a school, a clinic, and local businesses through a smart prepaid metering system.',
  'Phase 1: Community engagement and needs assessment. Phase 2: Grid design and procurement. Phase 3: Installation over 12 months. Phase 4: Training local technicians for maintenance.',
  '500+ homes now have reliable 24/7 electricity. School attendance increased by 35% due to evening study hours. Clinic can now store vaccines and operate medical equipment. 50+ new small businesses launched.',
  'A model project for rural electrification across West Africa.',
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop',
  'Engr. Tunde Okafor',
  'GreenGrid Africa',
  '2025-03-20',
  ARRAY['microgrid', 'rural-electrification', 'community', 'solar'],
  'published',
  now()
),
(
  '00000000-0000-0000-0000-000000000000',
  'Clean Cooking Adoption in Ibadan Community',
  'clean-cooking-ibadan',
  'impact_story',
  'Ibadan, Nigeria',
  'Clean Cooking',
  'How 2,000 households transitioned from firewood to clean cooking solutions, reducing health risks and deforestation.',
  'Households in peri-urban Ibadan relied on firewood and charcoal for cooking, causing respiratory illness (especially in women and children) and contributing to local deforestation.',
  'Distributed 2,000 clean cookstoves powered by LPG and bioethanol, paired with a community financing scheme allowing families to pay in affordable installments.',
  'Phase 1: Health impact baseline study. Phase 2: Community mobilization and training. Phase 3: Stove distribution with financing. Phase 4: Follow-up health monitoring.',
  '80% reduction in household air pollution. 60% decrease in respiratory illness among women. 15 tonnes of wood saved monthly. Carbon credits generated for community reinvestment.',
  'A story of health, environment, and community empowerment.',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=500&fit=crop',
  'Ngozi Eze',
  'CleanAir Nigeria Initiative',
  '2025-09-10',
  ARRAY['clean-cooking', 'health', 'community', 'impact'],
  'published',
  now()
),
(
  '00000000-0000-0000-0000-000000000000',
  'EV Charging Network Across Lagos Corridor',
  'ev-charging-lagos',
  'energy_project',
  'Lagos, Nigeria',
  'Electric Vehicles',
  'Deploying West Africa''s first intercity EV charging corridor connecting Lagos to Ibadan.',
  'The lack of EV charging infrastructure was the primary barrier to electric vehicle adoption in Nigeria. Range anxiety prevented potential EV owners from making the switch.',
  'Installed 15 fast-charging stations along the Lagos-Ibadan expressway, each powered by a hybrid solar-grid system with battery backup ensuring 99.5% uptime.',
  'Phase 1: Route planning and site acquisition. Phase 2: Solar canopy and charger installation. Phase 3: Payment app development. Phase 4: Launch and driver onboarding.',
  'Over 200 EVs now regularly use the corridor. 45% reduction in per-km travel cost for EV drivers. Sparked government interest in national EV infrastructure policy.',
  'Pioneering the future of transportation in West Africa.',
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop',
  'Chidi Nwosu',
  'VoltDrive Africa',
  '2025-11-01',
  ARRAY['EV', 'charging', 'infrastructure', 'Lagos'],
  'published',
  now()
);
