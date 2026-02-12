
-- Fix the security definer view issue by setting it to SECURITY INVOKER
ALTER VIEW public.public_profiles SET (security_invoker = on);
