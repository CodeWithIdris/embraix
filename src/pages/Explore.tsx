import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/components/store/StoreProductCard";
import {
  Compass, Flame, Newspaper, FileText, Star, ShoppingBag, Users, Video,
  ArrowRight, Clock, TrendingUp, BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Filter = "all" | "news" | "reviews" | "reports" | "products" | "stories";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "reviews", label: "Reviews" },
  { id: "reports", label: "Reports" },
  { id: "products", label: "Products" },
  { id: "stories", label: "Stories" },
];

const Explore = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const { track } = useAnalytics();

  useEffect(() => {
    track({ eventType: "page_view", metadata: { page: "/explore" } });
  }, []);

  const { data: trendingNews, isLoading: loadingTrending } = useQuery({
    queryKey: ["explore-trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image, published_at, category_id")
        .eq("status", "approved")
        .order("published_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const { data: latestArticles, isLoading: loadingArticles } = useQuery({
    queryKey: ["explore-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, excerpt, created_at, featured_image, slug")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["explore-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("store_products")
        .select("id, name, slug, price, currency, images, category, is_featured")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const { data: caseStudies, isLoading: loadingStories } = useQuery({
    queryKey: ["explore-stories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("case_studies")
        .select("id, title, excerpt, created_at, featured_image, slug, location")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  // Separate reviews from news by category
  const reviewsCategoryId = "0509d73c-0e45-435e-b1de-a0693127e644";
  const reviews = trendingNews?.filter(p => p.category_id === reviewsCategoryId) || [];
  const newsOnly = trendingNews?.filter(p => p.category_id !== reviewsCategoryId) || [];

  const show = (f: Filter) => filter === "all" || filter === f;

  return (
    <>
      <Helmet>
        <title>Explore | Embraix</title>
        <meta name="description" content="Discover the latest activity, insights, products, and innovations across Embraix." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Discovery Hub</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="text-gradient">Embraix</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Discover the latest activity, insights, products, and innovations across the Embraix ecosystem.
            </p>
          </div>

          <div className="flex gap-2 mb-8 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === opt.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Trending News */}
          {show("news") && (
            <ExploreSection icon={<Flame className="w-4 h-4 text-primary" />} title="Trending News" viewAll={{ label: "View all news", href: "/news" }}>
              {loadingTrending ? <SkeletonGrid /> : newsOnly.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {newsOnly.slice(0, 6).map((post) => (
                    <ContentCard key={post.id} title={post.title} excerpt={post.excerpt} image={post.featured_image} date={post.created_at!} badge="News" onClick={() => navigate(`/news/${post.id}`)} />
                  ))}
                </div>
              ) : <EmptyState label="No news yet." />}
            </ExploreSection>
          )}

          {/* Reviews */}
          {show("reviews") && (
            <ExploreSection icon={<Star className="w-4 h-4 text-primary" />} title="Popular Reviews" viewAll={{ label: "View all reviews", href: "/news" }}>
              {loadingTrending ? <SkeletonGrid /> : reviews.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {reviews.map((post) => (
                    <ContentCard key={post.id} title={post.title} excerpt={post.excerpt} image={post.featured_image} date={post.created_at!} badge="Review" onClick={() => navigate(`/news/${post.id}`)} />
                  ))}
                </div>
              ) : <EmptyState label="No reviews yet." />}
            </ExploreSection>
          )}

          {/* Reports & Articles */}
          {show("reports") && (
            <ExploreSection icon={<FileText className="w-4 h-4 text-primary" />} title="Latest Reports & Articles" viewAll={{ label: "View all reports", href: "/insight/reports" }}>
              {loadingArticles ? <SkeletonGrid /> : latestArticles?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestArticles.map((a) => (
                    <ContentCard key={a.id} title={a.title} excerpt={a.excerpt} image={a.featured_image} date={a.created_at!} badge="Article" onClick={() => navigate(`/blog/${a.slug}`)} />
                  ))}
                </div>
              ) : <EmptyState label="No articles published yet." />}
            </ExploreSection>
          )}

          {/* Featured Products */}
          {show("products") && (
            <ExploreSection icon={<ShoppingBag className="w-4 h-4 text-primary" />} title="Featured Products" viewAll={{ label: "Visit the Store", href: "/store/products" }}>
              {loadingProducts ? <SkeletonGrid /> : featuredProducts?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {featuredProducts.map((p: any) => (
                    <button key={p.id} onClick={() => navigate(`/store/products/${p.slug}`)} className="w-full text-left rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-card">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-36 bg-secondary flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted-foreground/40" /></div>
                      )}
                      <div className="p-3">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mb-1.5">{p.is_featured ? "Featured" : "Product"}</Badge>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{p.name}</h3>
                        <p className="text-sm font-bold text-primary">{formatPrice(p.price, p.currency)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : <EmptyState label="No products yet." />}
            </ExploreSection>
          )}

          {/* Stories & Case Studies */}
          {show("stories") && (
            <ExploreSection icon={<BookOpen className="w-4 h-4 text-primary" />} title="Stories & Voices" viewAll={{ label: "View all stories", href: "/media/stories" }}>
              {loadingStories ? <SkeletonGrid /> : caseStudies?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {caseStudies.map((s: any) => (
                    <ContentCard key={s.id} title={s.title} excerpt={s.excerpt} image={s.featured_image} date={s.created_at!} badge={s.location || "Story"} onClick={() => navigate(`/media/stories/${s.slug}`)} />
                  ))}
                </div>
              ) : <EmptyState label="No stories yet." />}
            </ExploreSection>
          )}

          {/* Community Highlights */}
          {filter === "all" && (
            <ExploreSection icon={<Users className="w-4 h-4 text-primary" />} title="Community Highlights" viewAll={{ label: "Visit the Centre", href: "/centre" }}>
              <div className="flex flex-col items-center gap-3 py-10 px-4 rounded-xl border border-dashed border-border/50 text-center bg-card/40">
                <span className="text-4xl">🏛️</span>
                <p className="text-sm text-muted-foreground max-w-xs">Activity from service providers, experts, and the community will appear here.</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/centre")}>Visit Centre</Button>
              </div>
            </ExploreSection>
          )}

          {/* Discover More */}
          {filter === "all" && (
            <section className="mt-8 p-6 rounded-xl border border-border/50 bg-card/60">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" /> Discover More on Embraix
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Media", href: "/media", emoji: "📰" },
                  { label: "AI Insights", href: "/ai", emoji: "🤖" },
                  { label: "Insight Hub", href: "/insight", emoji: "📊" },
                  { label: "Centre", href: "/centre", emoji: "🏛️" },
                  { label: "Store", href: "/store", emoji: "🛒" },
                  { label: "Consult Expert", href: "/consult-expert", emoji: "💬" },
                ].map((item) => (
                  <button key={item.label} onClick={() => navigate(item.href)} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground">
                    <span className="text-2xl">{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

const ExploreSection = ({ icon, title, viewAll, children }: { icon: React.ReactNode; title: string; viewAll: { label: string; href: string }; children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display font-semibold text-foreground text-base">{title}</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => navigate(viewAll.href)}>
          {viewAll.label} <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      {children}
    </section>
  );
};

const ContentCard = ({ title, excerpt, image, date, badge, onClick }: { title: string; excerpt?: string | null; image?: string | null; date: string; badge: string; onClick: () => void }) => (
  <button onClick={onClick} className="w-full text-left rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-card">
    {image ? (
      <img src={image} alt="" className="w-full h-36 object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-36 bg-secondary flex items-center justify-center"><Newspaper className="w-8 h-8 text-muted-foreground/40" /></div>
    )}
    <div className="p-3">
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 mb-1.5">{badge}</Badge>
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{title}</h3>
      {excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerpt}</p>}
      <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(date), { addSuffix: true })}
      </span>
    </div>
  </button>
);

const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
        <Skeleton className="w-full h-36" />
        <div className="p-3 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-3/4" /></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>
);

export default Explore;
