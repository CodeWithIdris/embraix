import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedProducts } from "@/hooks/useDashboard";
import { Heart, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { formatPrice } from "@/components/store/StoreProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const DashboardSavedProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: saved, isLoading } = useSavedProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRemove = async (savedId: string) => {
    const { error } = await supabase.from("saved_products").delete().eq("id", savedId);
    if (error) {
      toast({ title: "Error", description: "Failed to remove product", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["saved-products", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", user?.id] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Saved Products</h2>
        <Button size="sm" variant="outline" onClick={() => navigate("/store/products")}>
          Browse Store
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !saved?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No saved products</p>
            <Button variant="hero" size="sm" className="mt-4" onClick={() => navigate("/store/products")}>
              Explore Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {saved.map((s: any) => {
            const product = s.store_products;
            if (!product) return null;
            return (
              <Card key={s.id} className="gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      {product.brand && (
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      )}
                      <p className="text-base font-bold mt-1">{formatPrice(product.price, product.currency)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/store/products`)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardSavedProducts;
