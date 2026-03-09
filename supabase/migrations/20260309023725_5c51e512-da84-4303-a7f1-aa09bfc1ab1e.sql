
-- Create product category enum
CREATE TYPE public.store_product_category AS ENUM (
  'solar_panels', 'batteries', 'inverters', 'ev_chargers', 'smart_devices', 'accessories', 'bundles'
);

-- Create store_products table
CREATE TABLE public.store_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category store_product_category NOT NULL,
  brand TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NGN',
  power_capacity TEXT,
  battery_capacity TEXT,
  system_type TEXT,
  warranty_years INTEGER,
  installation_required BOOLEAN DEFAULT true,
  best_for TEXT,
  recommended_usage TEXT,
  features TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products (public store)
CREATE POLICY "Anyone can view active products"
  ON public.store_products
  FOR SELECT
  USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
  ON public.store_products
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
