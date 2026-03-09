
-- Saved products table
CREATE TABLE public.saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved products" ON public.saved_products
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can save products" ON public.saved_products
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave products" ON public.saved_products
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reports downloads tracking table
CREATE TABLE public.reports_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_title text NOT NULL,
  report_type text DEFAULT 'report',
  report_url text,
  downloaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reports_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own downloads" ON public.reports_downloads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can track downloads" ON public.reports_downloads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
