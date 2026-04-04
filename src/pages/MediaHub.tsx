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
import { usePublishedCaseStudies, getStoryTypeLabel } from "@/hooks/useCaseStudies";
import {
  Newspaper, PenTool, BookOpen, Wrench, Megaphone,
  Clock, ArrowRight, ExternalLink, MapPin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const sections = [
  { id: "updates", icon: Newspaper, label: "Updates", description: "Community news, announcements, and platform updates", href: "/news" },
  { id: "articles", icon: PenTool, label: "Articles", description: "Narrative pieces, thought leadership, and opinion", href: "/blog" },
  { id: "stories", icon: BookOpen, label: "Stories", description: "Case studies, success stories, and community voices", href: "/media/stories" },
  { id: "diy", icon: Wrench, label: "DIY", description: "Tutorials, explainers, and hands-on how-to guides", href: "/media/diy-guides" },
  { id: "promotions", icon: Megaphone, label: "Promotions", description: "Deals, partnerships, grants, and opportunities", href: "/promotions" },
];

const MediaHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("updates");
  const active = sections.find((s) => s.id === activeId)!;

  const { data: newsPosts, isLoading: loadingNews } = useQuery({
    queryKey: ["media-hub-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news_posts")
        .select("id, title, excerpt, created_at, featured_image, status")
        .eq("status", "approved")
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
    if (activeId === "updates") {
      if (loadingNews) return <LoadingSkeleton />;
      if (!newsPosts?.length) return <EmptyState label="No updates published yet." />;
      return (
        <div className="space-y-2">
          {newsPosts.map((post) => (
            <ListItem
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              image={post.featured_image}
              date={post.created_at}
              icon={Newspaper}
              onClick={() => navigate(`/news/${post.id}`)}
            />
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/news")}>
            View all updates
          </Button>
        </div>
      );
    }

    if (activeId === "articles") {
      if (loadingArticles) return <LoadingSkeleton />;
      if (!articles?.length) return <EmptyState label="No articles published yet." />;
      return (
        <div className="space-y-2">
          {articles.map((article) => (
            <ListItem
              key={article.id}
              title={article.title}
              excerpt={article.excerpt}
              image={article.featured_image}
              date={article.created_at}
              icon={PenTool}
              onClick={() => navigate(`/blog/${article.slug}`)}
            />
          ))}
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/blog")}>
            View all articles
          </Button>
        </div>
      );
    }

    if (activeId === "stories") {
      return <StoriesPanel navigate={navigate} />;
    }

    return (
      <ComingSoonPanel
        icon={active.icon}
        label={active.label}
        description={active.description}
        onNavigate={() => navigate(active.href)}
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>Media | Embraix</title>
        <meta name="description" content="Explore Embraix media — updates, articles, stories, DIY guides, and promotions." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Media</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Updates, articles, stories, and guides on clean energy.
            </p>
          </div>

          {/* Mobile tabs */}
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
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex gap-6">
            <aside className="hidden md:block w-48 flex-shrink-0">
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

            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-foreground">{active.label}</h2>
                  <p className="text-xs text-muted-foreground">{active.description}</p>
                </div>
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

const ListItem = ({
  title, excerpt, image, date, icon: Icon, onClick,
}: {
  title: string; excerpt: string | null; image: string | null;
  date: string | null; icon: React.ComponentType<{ className?: string }>; onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left flex gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
  >
    {image ? (
      <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
    ) : (
      <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{title}</h3>
      {excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{excerpt}</p>}
      {date && (
        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      )}
    </div>
    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center" />
  </button>
);

const LoadingSkeleton = () => (
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

const EmptyState = ({ label }: { label: string }) => (
  <div className="py-12 text-center text-sm text-muted-foreground">{label}</div>
);

const ComingSoonPanel = ({
  icon: Icon, label, description, onNavigate,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; description: string; onNavigate: () => void;
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

const StoriesPanel = ({ navigate }: { navigate: (path: string) => void }) => {
  const { data: stories, isLoading } = usePublishedCaseStudies("all");

  if (isLoading) return <LoadingSkeleton />;
  if (!stories?.length) return <EmptyState label="No stories published yet." />;

  return (
    <div className="space-y-2">
      {stories.slice(0, 8).map((story) => (
        <button
          key={story.id}
          onClick={() => navigate(`/media/stories/${story.slug}`)}
          className="w-full text-left flex gap-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
        >
          {story.featured_image ? (
            <img src={story.featured_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{getStoryTypeLabel(story.story_type)}</Badge>
            </div>
            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{story.title}</h3>
            {story.location && (
              <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {story.location}
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center" />
        </button>
      ))}
      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/media/stories")}>
        View all stories
      </Button>
    </div>
  );
};

export default MediaHub;
