import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  Compass, TrendingUp, Newspaper, PenTool, ArrowRight, Clock, Flame,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Filter = "all" | "news" | "articles";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "articles", label: "Articles" },
];

const Explore = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const { data: trendingNews, isLoading: loadingTrending } = useQuery({
    queryKey: ["explore-trending-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const { data: latestNews, isLoading: loadingLatestNews } = useQuery({
    queryKey: ["explore-latest-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  const { data: latestArticles, isLoading: loadingArticles } = useQuery({
    queryKey: ["explore-latest-articles"],
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

  const showNews = filter === "all" || filter === "news";
  const showArticles = filter === "all" || filter === "articles";

  return (
    <>
      <Helmet>
        <title>Explore | Embraix</title>
        <meta name="description" content="Discover trending news, articles, and insights from across the Embraix platform." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Discovery</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Explore <span className="text-gradient">Embraix</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              The latest trending content from across the platform — news, articles, insights, and more.
            </p>
          </div>

          {/* Filter tabs */}
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

          {/* Trending Section */}
          {showNews && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-base">Trending Now</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/news")}>
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              {loadingTrending ? (
                <CardSkeletonGrid />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trendingNews?.map((post) => (
                    <NewsCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      image={post.featured_image}
                      date={post.created_at!}
                      onClick={() => navigate(`/news/${post.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Latest News */}
          {showNews && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-base">Latest News</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/news")}>
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              {loadingLatestNews ? (
                <CardSkeletonGrid />
              ) : latestNews?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestNews.map((post) => (
                    <NewsCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      excerpt={post.excerpt}
                      image={post.featured_image}
                      date={post.created_at!}
                      onClick={() => navigate(`/news/${post.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptySection label="No news posts yet." />
              )}
            </section>
          )}

          {/* Latest Articles */}
          {showArticles && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  <h2 className="font-display font-semibold text-foreground text-base">Latest Articles</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/blog")}>
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
              {loadingArticles ? (
                <CardSkeletonGrid />
              ) : latestArticles?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {latestArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      title={article.title}
                      excerpt={article.excerpt}
                      image={article.featured_image}
                      date={article.created_at!}
                      onClick={() => navigate(`/blog/${article.slug}`)}
                    />
                  ))}
                </div>
              ) : (
                <EmptySection label="No articles published yet." />
              )}
            </section>
          )}

          {/* Discover More */}
          <section className="mt-8 p-6 rounded-xl border border-border/50 bg-card/60">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Discover More on Embraix
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "AI Insights", href: "/ai", emoji: "🤖" },
                { label: "Insight Hub", href: "/insight", emoji: "📊" },
                { label: "Centre", href: "/centre", emoji: "🏛️" },
                { label: "Store", href: "/store", emoji: "🛒" },
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
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

// ── Sub-components ──

const NewsCard = ({
  id, title, excerpt, image, date, onClick,
}: {
  id: string; title: string; excerpt?: string | null; image?: string | null;
  date: string; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-card"
  >
    {image ? (
      <img src={image} alt="" className="w-full h-36 object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-36 bg-secondary flex items-center justify-center">
        <Newspaper className="w-8 h-8 text-muted-foreground/40" />
      </div>
    )}
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
        {title}
      </h3>
      {excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerpt}</p>}
      <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(date), { addSuffix: true })}
      </span>
    </div>
  </button>
);

const ArticleCard = ({
  title, excerpt, image, date, onClick,
}: {
  title: string; excerpt?: string | null; image?: string | null; date: string; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left rounded-xl border border-border/40 overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all group bg-card"
  >
    {image ? (
      <img src={image} alt="" className="w-full h-36 object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-36 bg-secondary flex items-center justify-center">
        <PenTool className="w-8 h-8 text-muted-foreground/40" />
      </div>
    )}
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
        {title}
      </h3>
      {excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{excerpt}</p>}
      <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(date), { addSuffix: true })}
      </span>
    </div>
  </button>
);

const CardSkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border/40 overflow-hidden">
        <Skeleton className="w-full h-36" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const EmptySection = ({ label }: { label: string }) => (
  <div className="py-8 text-center text-sm text-muted-foreground">{label}</div>
);

export default Explore;
