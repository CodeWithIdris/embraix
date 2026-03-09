import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCompare } from "@/contexts/CompareContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatPrice } from "@/components/store/StoreProductCard";
import type { StoreProduct } from "@/hooks/useStoreProducts";
import {
  ArrowLeft, Heart, ShoppingBag, MessageCircle, Zap, Battery, Sun, Car, Cpu, Package,
  CheckCircle, Shield, Wrench, Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const categoryIcons: Record<string, React.ElementType> = {
  solar_panels: Sun, batteries: Battery, inverters: Zap, ev_chargers: Car,
  smart_devices: Cpu, accessories: Package, bundles: Package,
};

const categoryLabels: Record<string, string> = {
  solar_panels: "Solar Panel", batteries: "Battery", inverters: "Inverter",
  ev_chargers: "EV Charger", smart_devices: "Smart Device",
  accessories: "Accessory", bundles: "Bundle",
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["store-product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data as unknown as StoreProduct;
    },
    enabled: !!slug,
  });

  const { data: isSaved } = useQuery({
    queryKey: ["product-saved", product?.id, user?.id],
    queryFn: async () => {
      if (!user || !product) return false;
      const { data } = await supabase
        .from("saved_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!product,
  });

  const toggleSave = async () => {
    if (!user || !product) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    if (isSaved) {
      await supabase.from("saved_products").delete().eq("user_id", user.id).eq("product_id", product.id);
    } else {
      await supabase.from("saved_products").insert({ user_id: user.id, product_id: product.id });
    }
    queryClient.invalidateQueries({ queryKey: ["product-saved", product.id, user.id] });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <div className="text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Product not found.</p>
            <Button onClick={() => navigate("/store/products")}>Back to Store</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const Icon = categoryIcons[product.category] || Package;
  const inCompare = isInCompare(product.id);
  const specs = product.specifications || {};

  return (
    <>
      <Helmet>
        <title>{product.name} | Embraix Store</title>
        <meta name="description" content={product.description || `${product.name} - ${categoryLabels[product.category]}`} />
      </Helmet>
      <Header />

      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store/products")} className="mb-6 gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30 relative">
                {hasImages ? (
                  <>
                    <img
                      src={product.images![activeImage]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.images!.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveImage((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveImage((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-24 h-24 text-primary/20" />
                  </div>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && product.images!.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images!.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        idx === activeImage ? "border-primary" : "border-border/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {categoryLabels[product.category] || product.category}
                </Badge>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-sm text-muted-foreground mt-1">by {product.brand}</p>
                )}
              </div>

              <div className="text-3xl font-bold text-foreground">
                {formatPrice(product.price, product.currency)}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Key specs */}
              <div className="flex flex-wrap gap-2">
                {product.power_capacity && (
                  <Badge variant="outline" className="gap-1"><Zap className="w-3 h-3" />{product.power_capacity}</Badge>
                )}
                {product.battery_capacity && (
                  <Badge variant="outline" className="gap-1"><Battery className="w-3 h-3" />{product.battery_capacity}</Badge>
                )}
                {product.warranty_years && (
                  <Badge variant="outline" className="gap-1"><Shield className="w-3 h-3" />{product.warranty_years}yr warranty</Badge>
                )}
                {product.installation_required && (
                  <Badge variant="outline" className="gap-1"><Wrench className="w-3 h-3" />Installation required</Badge>
                )}
              </div>

              {product.best_for && (
                <p className="text-sm"><span className="font-medium text-primary">Best for:</span> {product.best_for}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant={isSaved ? "default" : "outline"}
                  className="gap-1.5"
                  onClick={toggleSave}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save Product"}
                </Button>
                <Button
                  variant={inCompare ? "secondary" : "outline"}
                  className="gap-1.5"
                  onClick={() => inCompare ? removeFromCompare(product.id) : addToCompare(product)}
                >
                  {inCompare ? "In Compare" : "Add to Compare"}
                </Button>
                <Button
                  variant="glass"
                  className="gap-1.5"
                  onClick={() => navigate("/chat", { state: { starterMessage: `Tell me about the ${product.name}` } })}
                >
                  <MessageCircle className="w-4 h-4" /> Ask AI
                </Button>
              </div>

              {product.stock_quantity !== null && (
                <p className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock_quantity} available)</span>
                  ) : (
                    <span className="text-destructive">Out of Stock</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Features & Specifications */}
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {product.features && product.features.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Features</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {Object.keys(specs).length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Specifications</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="font-medium text-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {product.recommended_usage && (
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <h3 className="font-display font-semibold mb-2">Recommended Usage</h3>
                <p className="text-muted-foreground">{product.recommended_usage}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default ProductDetail;
