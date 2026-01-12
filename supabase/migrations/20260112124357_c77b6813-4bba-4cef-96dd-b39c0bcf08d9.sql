-- Create post categories table
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.post_categories 
FOR SELECT 
USING (true);

-- Add category to news_posts
ALTER TABLE public.news_posts 
ADD COLUMN category_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL;

-- Create bookmarks table
CREATE TABLE public.post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON public.post_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks" 
ON public.post_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" 
ON public.post_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create message feedback table for AI chat
CREATE TABLE public.chat_message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_positive BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chat_message_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.chat_message_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own feedback
CREATE POLICY "Users can create their own feedback" 
ON public.chat_message_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update their own feedback" 
ON public.chat_message_feedback 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.post_categories (name, slug, color) VALUES
  ('Solar', 'solar', 'yellow'),
  ('Electric Vehicles', 'evs', 'blue'),
  ('Battery Storage', 'battery', 'green'),
  ('Smart Home', 'smart-home', 'purple'),
  ('Policy & Incentives', 'policy', 'orange'),
  ('General', 'general', 'gray');