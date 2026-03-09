
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Storage policies
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Also allow admins to manage all store_products (INSERT already covered by existing ALL policy)
-- Add policy for admins to manage inactive products too
CREATE POLICY "Admins can view all products including inactive"
  ON public.store_products FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
