-- User News Posts Table (separate from blog articles)
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- Policies for news_posts
CREATE POLICY "Anyone can view approved posts" ON public.news_posts
FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own posts" ON public.news_posts
FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authenticated users can create posts" ON public.news_posts
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own pending posts" ON public.news_posts
FOR UPDATE USING (auth.uid() = author_id AND status = 'pending');

CREATE POLICY "Users can delete own pending posts" ON public.news_posts
FOR DELETE USING (auth.uid() = author_id AND status = 'pending');

CREATE POLICY "Admins can manage all posts" ON public.news_posts
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Comments Table
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Anyone can view comments on approved posts" ON public.post_comments
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.news_posts WHERE id = post_id AND status = 'approved')
);

CREATE POLICY "Authenticated users can comment" ON public.post_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.post_comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage comments" ON public.post_comments
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Votes Table (Upvote/Downvote)
CREATE TABLE public.post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- Policies for votes
CREATE POLICY "Anyone can view votes" ON public.post_votes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.post_votes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vote" ON public.post_votes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote" ON public.post_votes
FOR DELETE USING (auth.uid() = user_id);

-- Expert Consultation Tickets
CREATE TABLE public.consultation_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_context TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.consultation_tickets ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
CREATE POLICY "Users can view own tickets" ON public.consultation_tickets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON public.consultation_tickets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON public.consultation_tickets
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets" ON public.consultation_tickets
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for tickets (for admin notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_tickets;
ALTER TABLE public.consultation_tickets REPLICA IDENTITY FULL;

-- Triggers for updated_at
CREATE TRIGGER update_news_posts_updated_at
BEFORE UPDATE ON public.news_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_tickets_updated_at
BEFORE UPDATE ON public.consultation_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();