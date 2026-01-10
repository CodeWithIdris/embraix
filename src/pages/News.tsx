import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNews, NewsPost, NewsPostFormData } from "@/hooks/useNews";
import {
  Plus, ArrowBigUp, ArrowBigDown, MessageCircle, User, Clock, Loader2, TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const News = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, loadApprovedPosts, createPost, vote } = useNews();

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewsPostFormData>({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [user?.id]);

  const loadPosts = async () => {
    const data = await loadApprovedPosts(user?.id);
    setPosts(data);
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
      setFormData({ title: "", content: "", excerpt: "", featured_image: "" });
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
      // Optimistically update the UI
      setPosts(posts.map(post => {
        if (post.id !== postId) return post;
        
        const currentUserVote = post.user_vote || 0;
        let newVoteCount = post.vote_count || 0;
        let newUserVote: number = voteType;
        
        if (currentUserVote === voteType) {
          // Toggling off the same vote
          newVoteCount -= voteType;
          newUserVote = 0;
        } else if (currentUserVote !== 0) {
          // Changing vote direction
          newVoteCount += voteType * 2;
        } else {
          // New vote
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

  const PostCard = ({ post }: { post: NewsPost }) => (
    <Card className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-8 w-8 ${post.user_vote === 1 ? "text-primary" : ""}`}
              onClick={() => handleVote(post.id, 1)}
            >
              <ArrowBigUp className="w-5 h-5" />
            </Button>
            <span className={`text-sm font-bold ${(post.vote_count || 0) > 0 ? "text-primary" : (post.vote_count || 0) < 0 ? "text-destructive" : ""}`}>
              {post.vote_count || 0}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-8 w-8 ${post.user_vote === -1 ? "text-destructive" : ""}`}
              onClick={() => handleVote(post.id, -1)}
            >
              <ArrowBigDown className="w-5 h-5" />
            </Button>
          </div>

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
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
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
                <MessageCircle className="w-3 h-3" />
                {post.comment_count} comments
              </div>
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
          <div className="flex items-center justify-between mb-8">
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

          {/* Posts Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No news posts yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default News;
