import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompare } from "@/contexts/CompareContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { StoreProduct } from "@/hooks/useStoreProducts";
import { Sun, Battery, Zap, Car, Cpu, Package, Heart } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  solar_panels: Sun,
  batteries: Battery,
  inverters: Zap,
  ev_chargers: Car,
  smart_devices: Cpu,
  accessories: Package,
  bundles: Package,
};

const categoryLabels: Record<string, string> = {
  solar_panels: "Solar Panel",
  batteries: "Battery",
  inverters: "Inverter",
  ev_chargers: "EV Charger",
  smart_devices: "Smart Device",
  accessories: "Accessory",
  bundles: "Bundle",
};

export const formatPrice = (price: number, currency: string = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
};

const StoreProductCard = ({ product }: { product: StoreProduct }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const inCompare = isInCompare(product.id);
  const Icon = categoryIcons[product.category] || Package;
  const hasImage = product.images && product.images.length > 0;

  const { data: isSaved } = useQuery({
    queryKey: ["product-saved", product.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("saved_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save products", variant: "destructive" });
      return;
    }

    if (isSaved) {
      await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", product.id);
    } else {
      await supabase.from("saved_products").insert({ user_id: user.id, product_id: product.id });
    }
    queryClient.invalidateQueries({ queryKey: ["product-saved", product.id, user.id] });
    queryClient.invalidateQueries({ queryKey: ["saved-products", user.id] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats", user.id] });
  };

  return (
    <Card className="gradient-card border-border/50 hover:shadow-elevated transition-all duration-300 group overflow-hidden">
      {/* Image or icon placeholder */}
      <div className="h-40 bg-secondary/30 flex items-center justify-center relative">
        <Icon className="w-12 h-12 text-primary/40" />
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
            Featured
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-background ${isSaved ? "text-rose-500" : "text-muted-foreground"}`}
          onClick={toggleSave}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Badge variant="secondary" className="text-xs mb-1.5">
              {categoryLabels[product.category] || product.category}
            </Badge>
            <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Key specs */}
        <div className="flex flex-wrap gap-1.5">
          {product.power_capacity && (
            <Badge variant="outline" className="text-xs font-normal">
              {product.power_capacity}
            </Badge>
          )}
          {product.battery_capacity && (
            <Badge variant="outline" className="text-xs font-normal">
              {product.battery_capacity}
            </Badge>
          )}
          {product.warranty_years && (
            <Badge variant="outline" className="text-xs font-normal">
              {product.warranty_years}yr warranty
            </Badge>
          )}
        </div>

        {product.best_for && (
          <p className="text-xs text-primary font-medium">🏷️ {product.best_for}</p>
        )}

        <div className="text-lg font-bold text-foreground">
          {formatPrice(product.price, product.currency)}
        </div>

        {/* Compare toggle */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/30">
          <Checkbox
            checked={inCompare}
            onCheckedChange={(checked) => {
              if (checked) addToCompare(product);
              else removeFromCompare(product.id);
            }}
            id={`compare-${product.id}`}
          />
          <label
            htmlFor={`compare-${product.id}`}
            className="text-xs text-muted-foreground cursor-pointer select-none"
          >
            Add to Compare
          </label>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreProductCard;
