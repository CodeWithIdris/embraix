import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  brand: string | null;
  price: number;
  currency: string;
  power_capacity: string | null;
  battery_capacity: string | null;
  system_type: string | null;
  warranty_years: number | null;
  installation_required: boolean | null;
  best_for: string | null;
  recommended_usage: string | null;
  features: string[] | null;
  specifications: Record<string, any> | null;
  images: string[] | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  stock_quantity: number | null;
  sku: string | null;
  created_at: string;
  updated_at: string;
};

export const useStoreProducts = (filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["store-products", filters],
    queryFn: async () => {
      let query = supabase
        .from("store_products" as any)
        .select("*")
        .eq("is_active", true)
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }
      if (filters?.brand) {
        query = query.eq("brand", filters.brand);
      }
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as StoreProduct[]) || [];
    },
  });
};
