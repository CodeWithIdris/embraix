
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update own pending posts" ON public.news_posts;
DROP POLICY IF EXISTS "Users can delete own pending posts" ON public.news_posts;

-- Create new policies without status restriction
CREATE POLICY "Users can update own posts"
ON public.news_posts
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
ON public.news_posts
FOR DELETE
USING (auth.uid() = author_id);
