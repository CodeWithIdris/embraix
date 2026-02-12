
-- Revert to security definer - this is intentional as the view only exposes safe columns (no email)
-- and needs to bypass RLS to allow public author attribution
ALTER VIEW public.public_profiles SET (security_invoker = off);
