
-- Create a public view that excludes sensitive email data
CREATE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- There's already a "Users can view own profile" policy, but let's ensure it exists
-- (it may have been dropped by the later migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
    AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
  END IF;
END $$;

-- Allow admins to view all profiles (needed for admin panel)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
