-- Add RLS policies for api_rate_limits table
-- This table tracks API rate limits per user/endpoint

-- Allow authenticated users to insert their own rate limit records
CREATE POLICY "Users can insert own rate limits"
ON public.api_rate_limits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.api_rate_limits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow the cleanup trigger (runs as service role) to delete old records
-- Service role bypasses RLS, so no explicit DELETE policy needed for cleanup
-- But add admin access for debugging
CREATE POLICY "Admins can manage all rate limits"
ON public.api_rate_limits FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));