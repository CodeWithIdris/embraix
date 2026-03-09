
-- Analytics events table for tracking platform activity
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  resource_id text,
  resource_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast queries by event type and time
CREATE INDEX idx_analytics_events_type_created ON public.analytics_events (event_type, created_at DESC);
CREATE INDEX idx_analytics_events_resource ON public.analytics_events (resource_type, resource_id, created_at DESC);
CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (fire-and-forget tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read all analytics"
  ON public.analytics_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Cleanup function for old events (keep 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.analytics_events WHERE created_at < now() - interval '90 days';
END;
$$;
