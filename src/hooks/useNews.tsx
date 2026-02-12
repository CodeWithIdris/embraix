import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NewsPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  vote_count?: number;
  user_vote?: number | null;
  comment_count?: number;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface NewsPostFormData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
}

export const useNews = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadApprovedPosts = async (userId?: string): Promise<NewsPost[]> => {
    try {
      const { data: posts, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("status", "approved")
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Fetch author details, vote counts, and user votes
      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          // Get author
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", post.author_id)
            .single() as { data: { full_name: string | null; avatar_url: string | null } | null };

          // Get vote count
          const { data: votes } = await supabase
            .from("post_votes")
            .select("vote_type")
            .eq("post_id", post.id);

          const voteCount = (votes || []).reduce((sum, v) => sum + v.vote_type, 0);

          // Get user's vote if logged in
          let userVote = 0;
          if (userId) {
            const { data: userVoteData } = await supabase
              .from("post_votes")
              .select("vote_type")
              .eq("post_id", post.id)
              .eq("user_id", userId)
              .maybeSingle();
            userVote = userVoteData?.vote_type || 0;
          }

          // Get comment count
          const { count: commentCount } = await supabase
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);

          return {
            ...post,
            author: author || undefined,
            vote_count: voteCount,
            user_vote: userVote,
            comment_count: commentCount || 0,
          };
        })
      );

      return enrichedPosts;
    } catch (err) {
      console.error("Error loading posts:", err);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
      return [];
    }
  };

  const loadUserPosts = async (userId: string): Promise<NewsPost[]> => {
    try {
      const { data: posts, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return posts || [];
    } catch (err) {
      console.error("Error loading user posts:", err);
      return [];
    }
  };

  const loadPendingPosts = async (): Promise<NewsPost[]> => {
    try {
      const { data: posts, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author details
      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", post.author_id)
            .single() as { data: { full_name: string | null; avatar_url: string | null } | null };

          return { ...post, author: author || undefined };
        })
      );

      return enrichedPosts;
    } catch (err) {
      console.error("Error loading pending posts:", err);
      return [];
    }
  };

  const loadPost = async (postId: string, userId?: string): Promise<NewsPost | null> => {
    try {
      const { data: post, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;

      // Get author
      const { data: author } = await supabase
        .from("public_profiles" as any)
        .select("full_name, avatar_url")
        .eq("id", post.author_id)
        .single() as { data: { full_name: string | null; avatar_url: string | null } | null };

      // Get vote count
      const { data: votes } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", post.id);

      const voteCount = (votes || []).reduce((sum, v) => sum + v.vote_type, 0);

      // Get user's vote if logged in
      let userVote = 0;
      if (userId) {
        const { data: userVoteData } = await supabase
          .from("post_votes")
          .select("vote_type")
          .eq("post_id", post.id)
          .eq("user_id", userId)
          .single();
        userVote = userVoteData?.vote_type || 0;
      }

      // Get comment count
      const { count: commentCount } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      return {
        ...post,
        author: author || undefined,
        vote_count: voteCount,
        user_vote: userVote,
        comment_count: commentCount || 0,
      };
    } catch (err) {
      console.error("Error loading post:", err);
      return null;
    }
  };

  const createPost = async (formData: NewsPostFormData, authorId: string): Promise<NewsPost | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news_posts")
        .insert({
          author_id: authorId,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || null,
          featured_image: formData.featured_image || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post Submitted",
        description: "Your post has been submitted for review",
      });

      return data;
    } catch (err) {
      console.error("Error creating post:", err);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId: string, formData: NewsPostFormData): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || null,
          featured_image: formData.featured_image || null,
        })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      return true;
    } catch (err) {
      console.error("Error updating post:", err);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Post deleted successfully",
      });

      return true;
    } catch (err) {
      console.error("Error deleting post:", err);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
      return false;
    }
  };

  const approvePost = async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({
          status: "approved",
          published_at: new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Approved",
        description: "Post has been published",
      });

      return true;
    } catch (err) {
      console.error("Error approving post:", err);
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
      return false;
    }
  };

  const rejectPost = async (postId: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Rejected",
        description: "Post has been rejected",
      });

      return true;
    } catch (err) {
      console.error("Error rejecting post:", err);
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
      return false;
    }
  };

  const vote = async (postId: string, userId: string, voteType: 1 | -1): Promise<boolean> => {
    try {
      // Check existing vote
      const { data: existingVote } = await supabase
        .from("post_votes")
        .select("id, vote_type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase.from("post_votes").delete().eq("id", existingVote.id);
        } else {
          // Update vote
          await supabase.from("post_votes").update({ vote_type: voteType }).eq("id", existingVote.id);
        }
      } else {
        // Create new vote
        await supabase.from("post_votes").insert({
          post_id: postId,
          user_id: userId,
          vote_type: voteType,
        });
      }

      return true;
    } catch (err) {
      console.error("Error voting:", err);
      toast({
        title: "Error",
        description: "Failed to vote",
        variant: "destructive",
      });
      return false;
    }
  };

  const loadComments = async (postId: string): Promise<PostComment[]> => {
    try {
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author details
      const enrichedComments = await Promise.all(
        (comments || []).map(async (comment) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", comment.user_id)
            .single() as { data: { full_name: string | null; avatar_url: string | null } | null };

          return { ...comment, author: author || undefined };
        })
      );

      return enrichedComments;
    } catch (err) {
      console.error("Error loading comments:", err);
      return [];
    }
  };

  const addComment = async (postId: string, userId: string, content: string, parentId?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          parent_id: parentId || null,
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted",
      });

      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      return false;
    }
  };

  return {
    loading,
    loadApprovedPosts,
    loadUserPosts,
    loadPendingPosts,
    loadPost,
    createPost,
    updatePost,
    deletePost,
    approvePost,
    rejectPost,
    vote,
    loadComments,
    addComment,
    deleteComment,
  };
};
