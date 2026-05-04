
-- Extend category enum with clean_cooking (idempotent)
DO $$ BEGIN
  ALTER TYPE store_product_category ADD VALUE IF NOT EXISTS 'clean_cooking';
EXCEPTION WHEN others THEN NULL; END $$;

-- Add new columns
ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS manufacturer_price numeric,
  ADD COLUMN IF NOT EXISTS markup_percent numeric NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS short_description text;

-- Backfill existing rows as published
UPDATE public.store_products SET status = 'published', source = COALESCE(source, 'manual') WHERE status = 'draft';

-- Index for duplicate detection
CREATE INDEX IF NOT EXISTS idx_store_products_brand_model ON public.store_products (brand, model);
CREATE INDEX IF NOT EXISTS idx_store_products_status ON public.store_products (status);

-- Replace public read policy to require status = 'published'
DROP POLICY IF EXISTS "Anyone can view active products" ON public.store_products;
CREATE POLICY "Anyone can view published products"
  ON public.store_products FOR SELECT
  USING (is_active = true AND status = 'published');
