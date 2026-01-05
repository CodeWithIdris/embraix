-- Create newsletter subscriptions table
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'newsletter', -- newsletter, ai_consult, signup
  UNIQUE(email)
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to subscribe
CREATE POLICY "Users can subscribe themselves"
ON public.newsletter_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own subscription
CREATE POLICY "Users can update own subscription"
ON public.newsletter_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role to read all (for edge functions)
CREATE POLICY "Service role can read all subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO service_role
USING (true);