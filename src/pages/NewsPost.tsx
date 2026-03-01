import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNews, NewsPost as NewsPostType, PostComment } from "@/hooks/useNews";
import { useToast } from "@/hooks/use-toast";
import PostActions from "@/components/news/PostActions";
import {
  ArrowLeft, User, Clock, Loader2, Send, Trash2, MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NewsPost = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadPost, vote, loadComments, addComment, deleteComment } = useNews();

  const [post, setPost] = useState<NewsPostType | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, user?.id]);

  const loadData = async () => {
    setLoading(true);
    if (!id) return;

    const postData = await loadPost(id, user?.id);
    if (!postData) {
      navigate("/news");
      return;
    }
    setPost(postData);

    const commentsData = await loadComments(id);
    setComments(commentsData);
    setLoading(false);
  };

  const handleVote = async (voteType: 1 | -1) => {
    if (!user || !id || !post) {
      navigate("/auth");
      return;
    }

    const success = await vote(id, user.id, voteType);
    if (success) {
      // Optimistically update the UI
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
      
      setPost({
        ...post,
        vote_count: newVoteCount,
        user_vote: newUserVote
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !id || !newComment.trim()) return;

    setSubmittingComment(true);
    const success = await addComment(id, user.id, newComment.trim());
    if (success) {
      setNewComment("");
      const commentsData = await loadComments(id);
      setComments(commentsData);
    }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success && id) {
      const commentsData = await loadComments(id);
      setComments(commentsData);
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
        <meta name="description" content={post.excerpt || post.content.slice(0, 160)} />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/news")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>

          {/* Post */}
          <Card className="gradient-card border-border/50 mb-8">
            <CardContent className="p-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                {post.title}
              </h1>

              {/* Author & Date */}
              <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.author?.avatar_url || undefined} />
                    <AvatarFallback>
                      {post.author?.full_name?.[0] || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {post.author?.full_name || "Anonymous"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-auto rounded-lg mb-6"
                />
              )}

              {/* Content */}
              <div 
                className="prose prose-invert max-w-none mb-6 text-foreground/90
                  prose-headings:text-foreground prose-headings:font-display
                  prose-p:mb-4 prose-a:text-primary prose-a:underline
                  prose-img:rounded-lg prose-img:max-w-full
                  prose-strong:text-foreground prose-em:text-foreground/80"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/50">
                <PostActions
                  postId={post.id}
                  voteCount={post.vote_count || 0}
                  userVote={post.user_vote || 0}
                  commentCount={comments.length}
                  title={post.title}
                  onVote={(voteType) => handleVote(voteType)}
                  onCommentClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div id="comments-section" className="space-y-6">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Comments ({comments.length})
            </h2>

            {/* New Comment */}
            {user ? (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleSubmitComment}
                          disabled={submittingComment || !newComment.trim()}
                        >
                          {submittingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground mb-2">Sign in to join the discussion</p>
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="gradient-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {comment.author?.full_name?.[0] || <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-foreground">
                              {comment.author?.full_name || "Anonymous"}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {user?.id === comment.user_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-foreground/90 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default NewsPost;
