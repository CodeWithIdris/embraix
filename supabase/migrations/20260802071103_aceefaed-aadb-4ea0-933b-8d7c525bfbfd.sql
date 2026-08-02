-- 1. expert_profiles: hide contact columns from anonymous visitors
REVOKE SELECT ON public.expert_profiles FROM anon;
GRANT SELECT (id, user_id, application_id, full_name, professional_title, expertise_areas, experience_years, bio, location, city, country, languages, linkedin, portfolio, avatar_url, hourly_rate, is_available, badges, certifications, rating, review_count, consultation_count, status, created_at, updated_at) ON public.expert_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expert_profiles TO authenticated;
GRANT ALL ON public.expert_profiles TO service_role;

-- 2. waitlist_users: remove public read, provide safe referral lookup
DROP POLICY IF EXISTS "Anyone can lookup referral codes" ON public.waitlist_users;
DROP POLICY IF EXISTS "Anyone can view referrals" ON public.referrals;

CREATE OR REPLACE FUNCTION public.lookup_referrer(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.waitlist_users
  WHERE referral_code = _code
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referrer(text) TO anon, authenticated;
REVOKE SELECT ON public.waitlist_users FROM anon;
GRANT INSERT ON public.waitlist_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_users TO authenticated;
GRANT ALL ON public.waitlist_users TO service_role;

-- 3. stop broadcasting sensitive tables over realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.consultation_tickets;
ALTER PUBLICATION supabase_realtime DROP TABLE public.expert_applications;