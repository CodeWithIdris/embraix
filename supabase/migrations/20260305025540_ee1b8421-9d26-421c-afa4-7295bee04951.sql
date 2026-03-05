
-- Create waitlist_users table
CREATE TABLE IF NOT EXISTS public.waitlist_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  country text,
  preferences jsonb DEFAULT '[]'::jsonb,
  referral_code text UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  referred_by uuid REFERENCES public.waitlist_users(id),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.waitlist_users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES public.waitlist_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_user_id)
);

-- Enable RLS
ALTER TABLE public.waitlist_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for waitlist (no login required)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_users FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow anonymous select for referral lookup
CREATE POLICY "Anyone can lookup referral codes" ON public.waitlist_users FOR SELECT TO anon, authenticated USING (true);

-- Admins can manage all waitlist users
CREATE POLICY "Admins can manage waitlist" ON public.waitlist_users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow anonymous inserts for referrals
CREATE POLICY "Anyone can create referrals" ON public.referrals FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can manage referrals
CREATE POLICY "Admins can manage referrals" ON public.referrals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow anon select on referrals for counting
CREATE POLICY "Anyone can view referrals" ON public.referrals FOR SELECT TO anon, authenticated USING (true);
