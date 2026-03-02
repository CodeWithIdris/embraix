import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useNews, PostComment } from "@/hooks/useNews";
import { supabase } from "@/integrations/supabase/client";
import {
  User, Loader2, Send, Trash2, MessageCircle, Reply, CornerDownRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ThreadedCommentsProps {
  postId: string;
  comments: PostComment[];
  onCommentsChange: () => void;
}

const ThreadedComments = ({ postId, comments, onCommentsChange }: ThreadedCommentsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addComment, deleteComment } = useNews();

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Build comment tree
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string): PostComment[] =>
    comments.filter(c => c.parent_id === parentId);

  const handleSubmitComment = async (parentId?: string) => {
    if (!user) return;

    const content = parentId ? replyContent.trim() : newComment.trim();
    if (!content) return;

    setSubmitting(true);
    const success = await addComment(postId, user.id, content, parentId);
    if (success) {
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }

      // Create notification for comment reply
      if (parentId) {
        const parentComment = comments.find(c => c.id === parentId);
        if (parentComment && parentComment.user_id !== user.id) {
          try {
            await supabase.from("notifications").insert({
              user_id: parentComment.user_id,
              type: "comment_reply",
              title: "New reply to your comment",
              message: content.slice(0, 100),
              reference_id: postId,
              reference_type: "news_post",
            });
          } catch (err) {
            console.error("Failed to create notification:", err);
          }
        }
      }

      onCommentsChange();
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) onCommentsChange();
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: PostComment; depth?: number }) => {
    const replies = getReplies(comment.id);
    const maxDepth = 3;

    return (
      <div className={depth > 0 ? "ml-6 md:ml-10 border-l-2 border-border/30 pl-4" : ""}>
        <div className="py-3">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={comment.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {comment.author?.full_name?.[0] || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {comment.author?.full_name || "Anonymous"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-destructive h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <p className="text-foreground/90 mt-1 text-sm">{comment.content}</p>

              {/* Reply button */}
              {user && depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary mt-1 h-7 px-2"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="w-3.5 h-3.5 mr-1" />
                  Reply
                </Button>
              )}

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="mt-2 flex gap-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleSubmitComment(comment.id)}
                      disabled={submitting || !replyContent.trim()}
                      className="h-8"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {replies.length > 0 && (
          <div>
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="comments-section" className="space-y-4">
      <h2 className="font-display text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Comments ({comments.length})
      </h2>

      {/* New Comment */}
      {user ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 shrink-0">
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
                    onClick={() => handleSubmitComment()}
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? (
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

      {/* Comments Tree */}
      <div className="space-y-1">
        {rootComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
};

export default ThreadedComments;
