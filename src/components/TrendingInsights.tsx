import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp, ShoppingBag, Newspaper, Wrench, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TrendingInsights = () => {
  const navigate = useNavigate();

  const { data: trendingProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_products")
        .select("id, name, slug, category, price, currency, images, is_featured")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(4);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: trendingNews, isLoading: loadingNews } = useQuery({
    queryKey: ["trending-news-home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, featured_image")
        .eq("status", "approved")
        .order("published_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const hasContent = (trendingProducts?.length || 0) > 0 || (trendingNews?.length || 0) > 0;
  if (!hasContent && !loadingProducts && !loadingNews) return null;

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl md:text-2xl font-bold">Trending on Embraix</h2>
        </div>

        {/* Popular Products */}
        {(loadingProducts || (trendingProducts?.length || 0) > 0) && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" /> Popular Products
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => navigate("/store/products")}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {trendingProducts?.map((p) => (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:border-primary/30 transition-colors border-border/50"
                    onClick={() => navigate(`/store/product/${p.slug}`)}
                  >
                    <CardContent className="p-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-20 object-cover rounded-md mb-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-20 bg-secondary rounded-md mb-2 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                      <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">
                          {p.category?.replace(/_/g, " ")}
                        </Badge>
                        {p.is_featured && (
                          <Badge className="text-[9px] px-1 py-0 bg-primary/20 text-primary">
                            Trending
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trending News */}
        {(loadingNews || (trendingNews?.length || 0) > 0) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <Newspaper className="w-4 h-4" /> Trending Energy News
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => navigate("/news")}
              >
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            {loadingNews ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {trendingNews?.map((post) => (
                  <Card
                    key={post.id}
                    className="cursor-pointer hover:border-primary/30 transition-colors border-border/50"
                    onClick={() => navigate(`/news/${post.id}`)}
                  >
                    <CardContent className="p-3 flex gap-3">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt=""
                          className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {post.excerpt}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingInsights;
