import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryFilter from "@/components/news/CategoryFilter";
import TrendingPosts from "@/components/news/TrendingPosts";
import BookmarkButton from "@/components/news/BookmarkButton";
import { useAuth } from "@/hooks/useAuth";
import { useNews, NewsPost, NewsPostFormData } from "@/hooks/useNews";
import PostActions from "@/components/news/PostActions";
import {
  Plus, User, Clock, Loader2, TrendingUp, BookOpen
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewsPostFormData & { category_id?: string }>({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredPosts(posts.filter(p => (p as any).category_id === selectedCategory));
    } else {
      setFilteredPosts(posts);
    }
  }, [selectedCategory, posts]);

  const loadPosts = async () => {
    const data = await loadApprovedPosts(user?.id);
    setPosts(data);
    setFilteredPosts(data);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from("post_categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) return;

    setSubmitting(true);
    const result = await createPost(formData, user.id);
    if (result) {
      setIsDialogOpen(false);
      setFormData({ title: "", content: "", excerpt: "", featured_image: "", category_id: "" });
    }
    setSubmitting(false);
  };

  const handleVote = async (postId: string, voteType: 1 | -1) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const success = await vote(postId, user.id, voteType);
    if (success) {
      setPosts(posts.map(post => {
        if (post.id !== postId) return post;
        
        const currentUserVote = post.user_vote || 0;
        let newVoteCount = post.vote_count || 0;
        let newUserVote: number = voteType;
        
        if (currentUserVote === voteType) {
          newVoteCount -= voteType;
          newUserVote = 0;
        } else if (currentUserVote !== 0) {
          newVoteCount += voteType * 2;
        } else {
          newVoteCount += voteType;
        }
        
        return {
          ...post,
          vote_count: newVoteCount,
          user_vote: newUserVote
        };
      }));
    }
  };

  const PostCard = ({ post }: { post: NewsPost }) => {
    const readingTime = calculateReadingTime(post.content);
    
    return (
      <Card className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/news/${post.id}`)}
              >
                <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Meta */}
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
                <BookmarkButton 
                  postId={post.id} 
                  userId={user?.id || null} 
                  onAuthRequired={() => navigate("/auth")}
                />
              </div>

              {/* Action Bar */}
              <div className="mt-3 pt-2 border-t border-border/30">
                <PostActions
                  postId={post.id}
                  voteCount={post.vote_count || 0}
                  userVote={post.user_vote || 0}
                  commentCount={post.comment_count || 0}
                  title={post.title}
                  onVote={(voteType) => handleVote(post.id, voteType)}
                  onCommentClick={() => navigate(`/news/${post.id}`)}
                  compact
                />
              </div>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="hidden sm:block w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
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
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                Community News
              </h1>
              <p className="text-muted-foreground mt-1">
                Share and discuss clean energy news with the community
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create a New Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What's the headline?"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Summary</label>
                    <Input
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief description (optional)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content *</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share the full story..."
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Featured Image URL</label>
                    <Input
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="https://..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="hero"
                      onClick={handleSubmit}
                      disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                      className="flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit for Review
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Your post will be reviewed by our team before publishing
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onSelect={setSelectedCategory} 
          />

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Main Posts */}
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {selectedCategory ? "No posts in this category yet." : "No news posts yet. Be the first to share!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Trending */}
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
