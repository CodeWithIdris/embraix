import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowRight, GitCompareArrows } from "lucide-react";
import { formatPrice } from "@/components/store/StoreProductCard";
import type { StoreProduct } from "@/hooks/useStoreProducts";

interface ChatProductCardsProps {
  slugs: string[];
}

const ChatProductCards = ({ slugs }: ChatProductCardsProps) => {
  const navigate = useNavigate();
  const { addToCompare, isInCompare } = useCompare();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["chat-products", slugs],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products" as any)
        .select("*")
        .in("slug", slugs)
        .eq("is_active", true);
      if (error) throw error;
      return (data as unknown as StoreProduct[]) || [];
    },
    enabled: slugs.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const toggleSave = async (product: StoreProduct) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save products", variant: "destructive" });
      return;
    }
    const { data: existing } = await supabase
      .from("saved_products")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("saved_products").delete().eq("id", existing.id);
    } else {
      await supabase.from("saved_products").insert({ user_id: user.id, product_id: product.id });
    }
    queryClient.invalidateQueries({ queryKey: ["product-saved"] });
    queryClient.invalidateQueries({ queryKey: ["saved-products"] });
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
        {slugs.map((s) => (
          <div key={s} className="w-56 h-48 shrink-0 rounded-xl bg-secondary/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto py-3 scrollbar-none -mx-1 px-1">
      {products.map((product) => (
        <div
          key={product.id}
          className="w-60 shrink-0 rounded-xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-shadow group"
        >
          {/* Image */}
          <div className="h-28 bg-secondary/30 overflow-hidden relative">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
            {product.best_for && (
              <Badge className="absolute top-1.5 left-1.5 text-[10px] bg-primary/90 text-primary-foreground">
                {product.best_for}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <h4 className="font-semibold text-xs leading-tight line-clamp-2">{product.name}</h4>
            
            <div className="flex items-center gap-2 flex-wrap">
              {product.power_capacity && (
                <span className="text-[10px] text-muted-foreground bg-secondary/50 rounded px-1.5 py-0.5">
                  {product.power_capacity}
                </span>
              )}
              {product.warranty_years && (
                <span className="text-[10px] text-muted-foreground bg-secondary/50 rounded px-1.5 py-0.5">
                  {product.warranty_years}yr warranty
                </span>
              )}
            </div>

            <p className="text-sm font-bold text-foreground">
              {formatPrice(product.price, product.currency)}
            </p>

            {/* Actions */}
            <div className="flex gap-1.5 pt-1">
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-7 text-[11px] gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/store/product/${product.slug}`);
                }}
              >
                View <ArrowRight className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCompare(product);
                }}
                title="Compare"
              >
                <GitCompareArrows className={`w-3 h-3 ${isInCompare(product.id) ? "text-primary" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(product);
                }}
                title="Save"
              >
                <Heart className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatProductCards;
