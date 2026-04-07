-- Allow admins to delete newsletter subscriptions
CREATE POLICY "Admins can manage all newsletter subscriptions"
ON public.newsletter_subscriptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete waitlist users
CREATE POLICY "Admins can manage all waitlist users"
ON public.waitlist_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));