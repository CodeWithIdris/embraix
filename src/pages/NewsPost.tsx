import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThreadedComments from "@/components/news/ThreadedComments";
import { useAuth } from "@/hooks/useAuth";
import { useNews, NewsPost as NewsPostType, PostComment } from "@/hooks/useNews";
import PostActions from "@/components/news/PostActions";
import ShareButtons from "@/components/news/ShareButtons";
import {
  ArrowLeft, User, Clock, Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Allow iframes for embedded video/audio
const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'audio', 'video', 'source', 'figure', 'figcaption'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'controls', 'preload', 'loading', 'style'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'form', 'input', 'object', 'embed'],
};

const NewsPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loadPost, vote, loadComments } = useNews();

  const [post, setPost] = useState<NewsPostType | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id, user?.id]);

  const loadData = async () => {
    setLoading(true);
    if (!id) return;
    const postData = await loadPost(id, user?.id);
    if (!postData) { navigate("/news"); return; }
    setPost(postData);
    const commentsData = await loadComments(id);
    setComments(commentsData);
    setLoading(false);
  };

  const refreshComments = async () => {
    if (!id) return;
    const commentsData = await loadComments(id);
    setComments(commentsData);
  };

  const handleVote = async (voteType: 1 | -1) => {
    if (!user || !id || !post) { navigate("/auth"); return; }
    const success = await vote(id, user.id, voteType);
    if (success) {
      const currentUserVote = post.user_vote || 0;
      let newVoteCount = post.vote_count || 0;
      let newUserVote: number = voteType;
      if (currentUserVote === voteType) { newVoteCount -= voteType; newUserVote = 0; }
      else if (currentUserVote !== 0) { newVoteCount += voteType * 2; }
      else { newVoteCount += voteType; }
      setPost({ ...post, vote_count: newVoteCount, user_vote: newUserVote });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Helmet>
        <title>{post.title} | Embraix News</title>
        <meta name="description" content={post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 160)} />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/news")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to News
          </Button>

          <Card className="gradient-card border-border/50 mb-8">
            <CardContent className="p-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{post.title}</h1>
              <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback>{post.author?.full_name?.[0] || <User className="w-4 h-4" />}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{post.author?.full_name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
                </div>
              </div>

              {post.featured_image && (
                <img src={post.featured_image} alt={post.title} className="w-full h-auto rounded-lg mb-6" loading="lazy" />
              )}

              <div
                className="prose dark:prose-invert max-w-none mb-6 text-foreground/90
                  prose-headings:text-foreground prose-headings:font-display
                  prose-p:mb-4 prose-a:text-primary prose-a:underline
                  prose-img:rounded-lg prose-img:max-w-full
                  prose-strong:text-foreground prose-em:text-foreground/80
                  [&_figure]:my-4 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground
                  [&_iframe]:w-full [&_iframe]:rounded-lg
                  [&_video]:w-full [&_video]:rounded-lg
                  [&_audio]:w-full"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, sanitizeConfig) }}
              />

              <div className="pt-4 border-t border-border/50">
                <PostActions
                  postId={post.id} voteCount={post.vote_count || 0} userVote={post.user_vote || 0}
                  commentCount={comments.length} title={post.title}
                  onVote={(voteType) => handleVote(voteType)}
                  onCommentClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}
                />
              </div>
            </CardContent>
          </Card>

          <ThreadedComments postId={post.id} comments={comments} onCommentsChange={refreshComments} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NewsPost;
