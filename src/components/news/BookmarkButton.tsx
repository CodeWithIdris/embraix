import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  postId: string;
  userId: string | null;
  onAuthRequired?: () => void;
  size?: "sm" | "default";
}

const BookmarkButton = ({ postId, userId, onAuthRequired, size = "sm" }: BookmarkButtonProps) => {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      checkBookmarkStatus();
    }
  }, [userId, postId]);

  const checkBookmarkStatus = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("post_bookmarks")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
    
    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!userId) {
      onAuthRequired?.();
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await supabase
          .from("post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        
        setIsBookmarked(false);
        toast({
          title: "Removed from bookmarks",
          description: "Post removed from your saved items.",
        });
      } else {
        await supabase
          .from("post_bookmarks")
          .insert({ post_id: postId, user_id: userId });
        
        setIsBookmarked(true);
        toast({
          title: "Saved to bookmarks",
          description: "You can find this post in your profile.",
        });
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      className={`${size === "sm" ? "h-8 w-8 p-0" : ""} ${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
    >
      {isBookmarked ? (
        <BookmarkCheck className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      ) : (
        <Bookmark className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
      )}
    </Button>
  );
};

export default BookmarkButton;
