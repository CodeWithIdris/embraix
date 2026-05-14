import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryFilter from "@/components/news/CategoryFilter";
import TrendingPosts from "@/components/news/TrendingPosts";
import BookmarkButton from "@/components/news/BookmarkButton";
import RichPostEditor from "@/components/news/RichPostEditor";
import { useAuth } from "@/hooks/useAuth";
import { useNews, NewsPost, NewsPostFormData } from "@/hooks/useNews";
import PostActions from "@/components/news/PostActions";
import {
  Plus, User, Clock, Loader2, TrendingUp, BookOpen, Video, Headphones, ImageIcon, Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { calculateReadingTime, formatReadingTime } from "@/lib/readingTime";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const News = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, loadApprovedPosts, createPost, vote } = useNews();

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<NewsPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [user?.id]);

  useEffect(() => {
    let result = [...posts];

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => (p as any).category_id === selectedCategory);
    }

    // Content type filter
    if (contentFilter !== "all") {
      result = result.filter(p => {
        const c = p.content.toLowerCase();
        switch (contentFilter) {
          case "video": return c.includes("<iframe") || c.includes("<video");
          case "podcast": return c.includes("<audio") || c.includes("spotify.com");
          case "gallery": return (c.match(/<img/g) || []).length > 2;
          default: return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "most_liked":
        result.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        break;
      case "most_commented":
        result.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
        break;
      default: // latest — already sorted
        break;
    }

    setFilteredPosts(result);
  }, [selectedCategory, contentFilter, sortBy, posts]);

  const loadPosts = async () => {
    const data = await loadApprovedPosts(user?.id);
    setPosts(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("post_categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const handleSubmit = async (formData: {
    title: string;
    content: string;
    excerpt: string;
    featured_image: string;
    category_id: string;
    content_type: string;
    subtitle?: string;
    scheduled_at?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  }) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const result = await createPost({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      featured_image: formData.featured_image,
      category_id: formData.category_id,
      subtitle: formData.subtitle,
      scheduled_at: formData.scheduled_at,
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      keywords: formData.keywords,
    }, user.id);
    if (result) {
      setIsDialogOpen(false);
      toast({ title: "Post submitted for review" });
    }
    setSubmitting(false);
  };

  const handleVote = async (postId: string, voteType: 1 | -1) => {
    if (!user) { navigate("/auth"); return; }
    const success = await vote(postId, user.id, voteType);
    if (success) {
      setPosts(posts.map(post => {
        if (post.id !== postId) return post;
        const currentUserVote = post.user_vote || 0;
        let newVoteCount = post.vote_count || 0;
        let newUserVote: number = voteType;
        if (currentUserVote === voteType) { newVoteCount -= voteType; newUserVote = 0; }
        else if (currentUserVote !== 0) { newVoteCount += voteType * 2; }
        else { newVoteCount += voteType; }
        return { ...post, vote_count: newVoteCount, user_vote: newUserVote };
      }));
    }
  };

  const getMediaIndicator = (content: string) => {
    const c = content.toLowerCase();
    const indicators = [];
    if (c.includes("<iframe") || c.includes("<video")) indicators.push({ icon: Video, label: "Video" });
    if (c.includes("<audio") || c.includes("spotify.com")) indicators.push({ icon: Headphones, label: "Audio" });
    if ((c.match(/<img/g) || []).length > 2) indicators.push({ icon: ImageIcon, label: "Gallery" });
    return indicators;
  };

  const PostCard = ({ post }: { post: NewsPost }) => {
    const readingTime = calculateReadingTime(post.content);
    const mediaIndicators = getMediaIndicator(post.content);

    return (
      <Card className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="cursor-pointer" onClick={() => navigate(`/news/${post.id}`)}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {mediaIndicators.map(({ icon: Icon, label }) => (
                    <Badge key={label} variant="outline" className="text-xs gap-1 py-0">
                      <Icon className="w-3 h-3" />{label}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {post.author?.full_name?.[0] || <User className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.author?.full_name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {formatReadingTime(readingTime)}
                </div>
                <BookmarkButton postId={post.id} userId={user?.id || null} onAuthRequired={() => navigate("/auth")} />
              </div>
              <div className="mt-3 pt-2 border-t border-border/30">
                <PostActions
                  postId={post.id} voteCount={post.vote_count || 0} userVote={post.user_vote || 0}
                  commentCount={post.comment_count || 0} title={post.title}
                  onVote={(voteType) => handleVote(post.id, voteType)}
                  onCommentClick={() => navigate(`/news/${post.id}`)} compact
                />
              </div>
            </div>
            {post.featured_image && (
              <div className="hidden sm:block w-28 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>News | Embraix - Community Clean Energy News</title>
        <meta name="description" content="Latest community news and discussions on clean energy, EVs, and sustainable technology in Africa." />
        <meta property="og:title" content="Embraix News — Community Clean Energy News" />
        <meta property="og:description" content="Community news and discussions on clean energy, EVs, and sustainable technology in Africa." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://embraix.lovable.app/news" />
        <link rel="canonical" href="https://embraix.lovable.app/news" />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                Community News
              </h1>
              <p className="text-muted-foreground mt-1">Share and discuss clean energy news with the community</p>
            </div>
            {user ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="gap-2"><Plus className="w-4 h-4" />Submit News</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Submit News</DialogTitle></DialogHeader>
                  <RichPostEditor categories={categories} onSubmit={handleSubmit} submitting={submitting} />
                </DialogContent>
              </Dialog>
            ) : (
              <Button variant="hero" className="gap-2" onClick={() => navigate("/auth")}>
                <Plus className="w-4 h-4" />Submit News
              </Button>
            )}
          </div>

          <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

          {/* Filters Row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
            </div>
            <Select value={contentFilter} onValueChange={setContentFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="video">🎥 Videos</SelectItem>
                <SelectItem value="podcast">🎙 Podcasts</SelectItem>
                <SelectItem value="gallery">🖼 Galleries</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="most_liked">Most Liked</SelectItem>
                <SelectItem value="most_commented">Most Commented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filteredPosts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {selectedCategory || contentFilter !== "all" ? "No matching posts found." : "No news posts yet. Be the first to share!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <TrendingPosts posts={posts} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default News;
