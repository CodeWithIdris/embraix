import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, MessageCircle, Share2, Twitter, Facebook, Linkedin, Link2, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  postId: string;
  voteCount: number;
  userVote: number;
  commentCount: number;
  title: string;
  onVote: (voteType: 1 | -1) => void;
  onCommentClick?: () => void;
  compact?: boolean;
}

const PostActions = ({
  postId,
  voteCount,
  userVote,
  commentCount,
  title,
  onVote,
  onCommentClick,
  compact = false,
}: PostActionsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const postUrl = `${window.location.origin}/news/${postId}`;
  const isLiked = userVote === 1;

  const handleLike = () => {
    setLikeAnimating(true);
    onVote(1);
    setTimeout(() => setLikeAnimating(false), 400);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const iconSize = compact ? "w-4 h-4" : "w-5 h-5";
  const btnSize = compact ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm";

  return (
    <div className="flex items-center gap-1">
      {/* Like */}
      <Button
        variant="ghost"
        className={cn(
          btnSize,
          "gap-1.5 rounded-full transition-all",
          isLiked
            ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
      >
        <Heart
          className={cn(
            iconSize,
            "transition-transform",
            isLiked && "fill-current",
            likeAnimating && "scale-125"
          )}
        />
        <span className="font-semibold">{voteCount > 0 ? voteCount : ""}</span>
      </Button>

      {/* Comment */}
      <Button
        variant="ghost"
        className={cn(
          btnSize,
          "gap-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onCommentClick?.();
        }}
      >
        <MessageCircle className={iconSize} />
        <span className="font-semibold">{commentCount > 0 ? commentCount : ""}</span>
      </Button>

      {/* Share */}
      <Popover open={shareOpen} onOpenChange={setShareOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              btnSize,
              "gap-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className={iconSize} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start" onClick={(e) => e.stopPropagation()}>
          <div className="grid gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                window.open(shareLinks.twitter, "_blank", "width=600,height=400");
                setShareOpen(false);
              }}
            >
              <Twitter className="w-4 h-4" /> Twitter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                window.open(shareLinks.facebook, "_blank", "width=600,height=400");
                setShareOpen(false);
              }}
            >
              <Facebook className="w-4 h-4" /> Facebook
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                window.open(shareLinks.linkedin, "_blank", "width=600,height=400");
                setShareOpen(false);
              }}
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-sm"
              onClick={() => {
                copyLink();
                setShareOpen(false);
              }}
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PostActions;
