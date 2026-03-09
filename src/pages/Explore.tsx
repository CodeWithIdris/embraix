import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Compass,
  Flame,
  Newspaper,
  FileText,
  Star,
  ShoppingBag,
  Users,
  Video,
  ArrowRight,
  Clock,
  Eye,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Filter = "all" | "news" | "reviews" | "reports" | "products" | "videos";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "reviews", label: "Reviews" },
  { id: "reports", label: "Reports" },
  { id: "products", label: "Products" },
  { id: "videos", label: "Videos" },
];

const Explore = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  // Trending news (by published_at recency as proxy for trending)
  const { data: trendingNews, isLoading: loadingTrending } = useQuery({
    queryKey: ["explore-trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image, published_at")
        .eq("status", "approved")
        .order("published_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  // Latest news
  const { data: latestNews, isLoading: loadingNews } = useQuery({
    queryKey: ["explore-latest-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  // Latest articles (as community highlights / reports)
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

  const show = (f: Filter) => filter === "all" || filter === f;

  return (
    <>
      <Helmet>
        <title>Explore | Embraix</title>
        <meta
          name="description"
          content="Discover the latest activity, insights, products, and innovations across Embraix."
        />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Hero header ── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Discovery Hub
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Explore <span className="text-gradient">Embraix</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Discover the latest activity, insights, products, and innovations
              across the Embraix ecosystem.
            </p>
          </div>

          {/* ── Filters ── */}
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

          {/* ── Trending Now ── */}
          {show("news") && (
            <ExploreSection
              icon={<Flame className="w-4 h-4 text-primary" />}
              title="Trending Now"
              viewAll={{ label: "View all news", href: "/news" }}
            >
              {loadingTrending ? (
                <SkeletonGrid />
              ) : trendingNews?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trendingNews.map((post) => (
                    <ContentCard
                      key={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      image={post.featured_image}
                      date={post.created_at!}
                      badge="News"
                      fallbackIcon={<Newspaper className="w-8 h-8 text-muted-foreground/40" />}
                      onClick={() => navigate(`/news/${post.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState label="No trending content yet." />
              )}
            </ExploreSection>
          )}

          {/* ── Latest News ── */}
          {show("news") && (
            <ExploreSection
              icon={<Newspaper className="w-4 h-4 text-primary" />}
              title="Latest News"
              viewAll={{ label: "View all news", href: "/news" }}
            >
              {loadingNews ? (
                <SkeletonGrid />
              ) : latestNews?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestNews.map((post) => (
                    <ContentCard
                      key={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      image={post.featured_image}
                      date={post.created_at!}
                      badge="News"
                      fallbackIcon={<Newspaper className="w-8 h-8 text-muted-foreground/40" />}
                      onClick={() => navigate(`/news/${post.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState label="No news posts yet." />
              )}
            </ExploreSection>
          )}

          {/* ── Latest Reports / Articles ── */}
          {show("reports") && (
            <ExploreSection
              icon={<FileText className="w-4 h-4 text-primary" />}
              title="Latest Reports & Articles"
              viewAll={{ label: "View all reports", href: "/insight/reports" }}
            >
              {loadingArticles ? (
                <SkeletonGrid />
              ) : latestArticles?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestArticles.map((article) => (
                    <ContentCard
                      key={article.id}
                      title={article.title}
                      excerpt={article.excerpt}
                      image={article.featured_image}
                      date={article.created_at!}
                      badge="Article"
                      fallbackIcon={<FileText className="w-8 h-8 text-muted-foreground/40" />}
                      onClick={() => navigate(`/blog/${article.slug}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState label="No articles published yet." />
              )}
            </ExploreSection>
          )}

          {/* ── Popular Reviews (Coming Soon) ── */}
          {show("reviews") && (
            <ExploreSection
              icon={<Star className="w-4 h-4 text-primary" />}
              title="Popular Reviews"
              viewAll={{ label: "View all reviews", href: "/media/reviews" }}
            >
              <ComingSoonCard
                emoji="⭐"
                label="Product & technology reviews are coming soon."
                cta="Browse Media"
                href="/media"
              />
            </ExploreSection>
          )}

          {/* ── Featured Products (Coming Soon) ── */}
          {show("products") && (
            <ExploreSection
              icon={<ShoppingBag className="w-4 h-4 text-primary" />}
              title="Featured Products"
              viewAll={{ label: "Visit the Store", href: "/store" }}
            >
              <ComingSoonCard
                emoji="🛒"
                label="Featured clean energy products will appear here soon."
                cta="Visit Store"
                href="/store"
              />
            </ExploreSection>
          )}

          {/* ── Videos & Media (Coming Soon) ── */}
          {show("videos") && (
            <ExploreSection
              icon={<Video className="w-4 h-4 text-primary" />}
              title="Videos & Media"
              viewAll={{ label: "View all media", href: "/media" }}
            >
              <ComingSoonCard
                emoji="🎬"
                label="Video content on energy, EVs, and smart tech is coming soon."
                cta="Browse Media"
                href="/media"
              />
            </ExploreSection>
          )}

          {/* ── Community Highlights (Coming Soon) ── */}
          {(filter === "all") && (
            <ExploreSection
              icon={<Users className="w-4 h-4 text-primary" />}
              title="Community Highlights"
              viewAll={{ label: "Visit the Centre", href: "/centre" }}
            >
              <ComingSoonCard
                emoji="🏛️"
                label="Activity from service providers, experts, and the community will appear here."
                cta="Visit Centre"
                href="/centre"
              />
            </ExploreSection>
          )}

          {/* ── Discover More ── */}
          {filter === "all" && (
            <section className="mt-8 p-6 rounded-xl border border-border/50 bg-card/60">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Discover More on Embraix
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
                  <button
                    key={item.label}
                    onClick={() => navigate(item.href)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
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

// ── Shared sub-components ──────────────────────────────────────────────────

const ExploreSection = ({
  icon,
  title,
  viewAll,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  viewAll: { label: string; href: string };
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-display font-semibold text-foreground text-base">{title}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(viewAll.href)}
        >
          {viewAll.label} <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
      {children}
    </section>
  );
};

const ContentCard = ({
  title,
  excerpt,
  image,
  date,
  badge,
  fallbackIcon,
  onClick,
}: {
  title: string;
  excerpt?: string | null;
  image?: string | null;
  date: string;
  badge: string;
  fallbackIcon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-card"
  >
    {image ? (
      <img src={image} alt="" className="w-full h-36 object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-36 bg-secondary flex items-center justify-center">
        {fallbackIcon}
      </div>
    )}
    <div className="p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{badge}</Badge>
      </div>
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
        {title}
      </h3>
      {excerpt && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerpt}</p>
      )}
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
        <div className="p-3 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>
);

const ComingSoonCard = ({
  emoji,
  label,
  cta,
  href,
}: {
  emoji: string;
  label: string;
  cta: string;
  href: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-3 py-10 px-4 rounded-xl border border-dashed border-border/50 text-center bg-card/40">
      <span className="text-4xl">{emoji}</span>
      <p className="text-sm text-muted-foreground max-w-xs">{label}</p>
      <Button variant="outline" size="sm" onClick={() => navigate(href)}>
        {cta}
      </Button>
    </div>
  );
};

export default Explore;
