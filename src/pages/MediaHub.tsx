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
  Newspaper, FileText, Star, Wrench, BookOpen, Megaphone, PenTool,
  Clock, ArrowRight, ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const sections = [
  { id: "news", icon: Newspaper, label: "News & Updates", description: "Community news, announcements, and platform updates", href: "/news" },
  { id: "reports", icon: FileText, label: "Reports & Analysis", description: "In-depth research, data analysis, and industry reports", href: "/media/reports" },
  { id: "reviews", icon: Star, label: "Reviews", description: "Product reviews, comparisons, and expert ratings", href: "/media/reviews" },
  { id: "diy", icon: Wrench, label: "DIY Guides", description: "Tutorials, explainers, and hands-on how-to guides", href: "/media/diy-guides" },
  { id: "stories", icon: BookOpen, label: "Stories & Voices", description: "Case studies, success stories, and community voices", href: "/media/stories" },
  { id: "promotions", icon: Megaphone, label: "Promotions", description: "Deals, partnerships, grants, and opportunities", href: "/promotions" },
  { id: "articles", icon: PenTool, label: "Articles", description: "Narrative pieces, thought leadership, and opinion", href: "/blog" },
];

const MediaHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("news");
  const active = sections.find((s) => s.id === activeId)!;

  const { data: newsPosts, isLoading: loadingNews } = useQuery({
    queryKey: ["media-hub-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image, status")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["media-hub-articles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, excerpt, created_at, featured_image, slug")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  const renderContent = () => {
    if (activeId === "news") {
      if (loadingNews) {
        return (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/30">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (!newsPosts?.length) {
        return <EmptyState label="No news published yet." />;
      }
      return (
        <div className="space-y-2">
          {newsPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/news/${post.id}`)}
              className="w-full text-left flex gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              {post.featured_image ? (
                <img src={post.featured_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{post.excerpt}</p>
                )}
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.created_at!), { addSuffix: true })}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/news")}>
            View all news
          </Button>
        </div>
      );
    }

    if (activeId === "articles") {
      if (loadingArticles) {
        return (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border border-border/30">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (!articles?.length) {
        return <EmptyState label="No articles published yet." />;
      }
      return (
        <div className="space-y-2">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => navigate(`/blog/${article.slug}`)}
              className="w-full text-left flex gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              {article.featured_image ? (
                <img src={article.featured_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <PenTool className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{article.excerpt}</p>
                )}
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(article.created_at!), { addSuffix: true })}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/blog")}>
            View all articles
          </Button>
        </div>
      );
    }

    // Coming soon for other sections
    return (
      <ComingSoonPanel
        icon={active.icon}
        label={active.label}
        description={active.description}
        href={active.href}
        onNavigate={() => navigate(active.href)}
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>Media | Embraix</title>
        <meta name="description" content="Explore Embraix media — news, reports, reviews, guides, stories, and articles." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Media</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              News, analysis, tutorials, and stories on clean energy across Africa and beyond.
            </p>
          </div>

          {/* Mobile: horizontal scroll tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden scrollbar-none">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeId === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
                }`}
              >
                <s.icon className="w-3 h-3" />
                {s.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Desktop: sidebar + content */}
          <div className="flex gap-6">
            {/* Left sidebar - desktop only */}
            <aside className="hidden md:block w-52 flex-shrink-0">
              <nav className="sticky top-24 space-y-0.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeId === s.id
                        ? "bg-primary/10 text-primary font-medium border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <s.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Right content panel */}
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-foreground">{active.label}</h2>
                  <p className="text-xs text-muted-foreground">{active.description}</p>
                </div>
                <Badge variant="outline" className="text-xs hidden sm:flex">{active.label.split(" ")[0]}</Badge>
              </div>
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-12 text-center text-sm text-muted-foreground">{label}</div>
);

const ComingSoonPanel = ({
  icon: Icon,
  label,
  description,
  href,
  onNavigate,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  href: string;
  onNavigate: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-dashed border-border/50 rounded-xl">
    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <div>
      <h3 className="font-display font-semibold text-foreground mb-1">{label}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
    <Badge variant="outline" className="gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
      Coming Soon
    </Badge>
    <Button variant="outline" size="sm" onClick={onNavigate} className="gap-1">
      <ExternalLink className="w-3.5 h-3.5" />
      Visit page
    </Button>
  </div>
);

export default MediaHub;
