-- Create enum for service categories
CREATE TYPE public.service_category AS ENUM (
  'consultation',
  'installation', 
  'repair',
  'sales',
  'maintenance',
  'training',
  'audit',
  'other'
);

-- Create enum for provider status
CREATE TYPE public.provider_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'expired'
);

-- Create service_providers table (premium subscription required)
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'individual', -- 'individual' or 'business'
  description TEXT,
  logo_url TEXT,
  cover_image TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  categories service_category[] NOT NULL DEFAULT '{}',
  status provider_status NOT NULL DEFAULT 'pending',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  paystack_customer_id TEXT,
  paystack_subscription_code TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create service_listings table (provider's catalogue)
CREATE TABLE public.service_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category service_category NOT NULL,
  price_range TEXT,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_projects table (portfolio)
CREATE TABLE public.provider_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  completion_date DATE,
  client_name TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_reviews table
CREATE TABLE public.provider_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

-- Create service_messages table (in-app messaging)
CREATE TABLE public.service_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_id UUID REFERENCES public.service_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_messages ENABLE ROW LEVEL SECURITY;

-- RLS for service_providers
CREATE POLICY "Anyone can view active providers"
ON public.service_providers FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can view own provider profile"
ON public.service_providers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own provider profile"
ON public.service_providers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider profile"
ON public.service_providers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all providers"
ON public.service_providers FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS for service_listings
CREATE POLICY "Anyone can view active listings from active providers"
ON public.service_listings FOR SELECT
USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.service_providers 
    WHERE id = service_listings.provider_id AND status = 'active'
  )
);

CREATE POLICY "Providers can view own listings"
ON public.service_listings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers 
    WHERE id = service_listings.provider_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Providers can manage own listings"
ON public.service_listings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers 
    WHERE id = service_listings.provider_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all listings"
ON public.service_listings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS for provider_projects
CREATE POLICY "Anyone can view projects from active providers"
ON public.provider_projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers 
    WHERE id = provider_projects.provider_id AND status = 'active'
  )
);

CREATE POLICY "Providers can manage own projects"
ON public.provider_projects FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers 
    WHERE id = provider_projects.provider_id AND user_id = auth.uid()
  )
);

-- RLS for provider_reviews
CREATE POLICY "Anyone can view reviews"
ON public.provider_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.provider_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON public.provider_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.provider_reviews FOR DELETE
USING (auth.uid() = user_id);

-- RLS for service_messages
CREATE POLICY "Users can view own messages"
ON public.service_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.service_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update messages (mark read)"
ON public.service_messages FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create indexes for performance
CREATE INDEX idx_service_providers_status ON public.service_providers(status);
CREATE INDEX idx_service_providers_categories ON public.service_providers USING GIN(categories);
CREATE INDEX idx_service_providers_city ON public.service_providers(city);
CREATE INDEX idx_service_listings_provider ON public.service_listings(provider_id);
CREATE INDEX idx_service_listings_category ON public.service_listings(category);
CREATE INDEX idx_provider_projects_provider ON public.provider_projects(provider_id);
CREATE INDEX idx_service_messages_sender ON public.service_messages(sender_id);
CREATE INDEX idx_service_messages_recipient ON public.service_messages(recipient_id);

-- Trigger for updated_at
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_listings_updated_at
BEFORE UPDATE ON public.service_listings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_projects_updated_at
BEFORE UPDATE ON public.provider_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_reviews_updated_at
BEFORE UPDATE ON public.provider_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_messages;