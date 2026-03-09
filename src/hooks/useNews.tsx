import { useState } from "react";
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
  subtitle?: string | null;
  scheduled_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string[] | null;
  category_id?: string | null;
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
  subtitle?: string;
  category_id?: string;
  scheduled_at?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
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

      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const [authorRes, votesRes, commentRes, userVoteRes] = await Promise.all([
            supabase.from("public_profiles" as any).select("full_name, avatar_url").eq("id", post.author_id).single() as any,
            supabase.from("post_votes").select("vote_type").eq("post_id", post.id),
            supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            userId
              ? supabase.from("post_votes").select("vote_type").eq("post_id", post.id).eq("user_id", userId).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          const voteCount = (votesRes.data || []).reduce((sum: number, v: any) => sum + v.vote_type, 0);

          return {
            ...post,
            author: authorRes.data || undefined,
            vote_count: voteCount,
            user_vote: userVoteRes.data?.vote_type || 0,
            comment_count: commentRes.count || 0,
          };
        })
      );

      return enrichedPosts;
    } catch (err) {
      console.error("Error loading posts:", err);
      toast({ title: "Error", description: "Failed to load posts", variant: "destructive" });
      return [];
    }
  };

  const loadUserPosts = async (userId: string): Promise<NewsPost[]> => {
    try {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
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

      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", post.author_id)
            .single() as any;
          return { ...post, author: author || undefined };
        })
      );
      return enrichedPosts;
    } catch (err) {
      console.error("Error loading pending posts:", err);
      return [];
    }
  };

  const loadAllPosts = async (): Promise<NewsPost[]> => {
    try {
      const { data: posts, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enrichedPosts = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", post.author_id)
            .single() as any;
          return { ...post, author: author || undefined };
        })
      );
      return enrichedPosts;
    } catch (err) {
      console.error("Error loading all posts:", err);
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

      const [authorRes, votesRes, commentRes, userVoteRes] = await Promise.all([
        supabase.from("public_profiles" as any).select("full_name, avatar_url").eq("id", post.author_id).single() as any,
        supabase.from("post_votes").select("vote_type").eq("post_id", post.id),
        supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
        userId
          ? supabase.from("post_votes").select("vote_type").eq("post_id", post.id).eq("user_id", userId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const voteCount = (votesRes.data || []).reduce((sum: number, v: any) => sum + v.vote_type, 0);

      return {
        ...post,
        author: authorRes.data || undefined,
        vote_count: voteCount,
        user_vote: userVoteRes.data?.vote_type || 0,
        comment_count: commentRes.count || 0,
      };
    } catch (err) {
      console.error("Error loading post:", err);
      return null;
    }
  };

  const loadRelatedPosts = async (postId: string, categoryId?: string | null, limit = 3): Promise<NewsPost[]> => {
    try {
      let query = supabase
        .from("news_posts")
        .select("*")
        .eq("status", "approved")
        .neq("id", postId)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // If we got fewer than limit results with category filter, fill with any posts
      let posts = data || [];
      if (categoryId && posts.length < limit) {
        const existingIds = [postId, ...posts.map(p => p.id)];
        const { data: morePosts } = await supabase
          .from("news_posts")
          .select("*")
          .eq("status", "approved")
          .not("id", "in", `(${existingIds.join(",")})`)
          .order("published_at", { ascending: false })
          .limit(limit - posts.length);
        posts = [...posts, ...(morePosts || [])];
      }

      const enriched = await Promise.all(
        posts.map(async (post) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", post.author_id)
            .single() as any;
          return { ...post, author: author || undefined };
        })
      );
      return enriched;
    } catch (err) {
      console.error("Error loading related posts:", err);
      return [];
    }
  };

  const createPost = async (formData: NewsPostFormData, authorId: string): Promise<NewsPost | null> => {
    setLoading(true);
    try {
      const isScheduled = formData.scheduled_at && new Date(formData.scheduled_at) > new Date();

      const { data, error } = await supabase
        .from("news_posts")
        .insert({
          author_id: authorId,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || null,
          featured_image: formData.featured_image || null,
          subtitle: (formData as any).subtitle || null,
          category_id: formData.category_id || null,
          scheduled_at: formData.scheduled_at || null,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          keywords: formData.keywords?.length ? formData.keywords : null,
          status: "pending",
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post Submitted",
        description: isScheduled
          ? "Your post has been submitted for review and will be published on schedule once approved."
          : "Your post has been submitted for review",
      });

      return data;
    } catch (err) {
      console.error("Error creating post:", err);
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
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
          subtitle: (formData as any).subtitle || null,
          category_id: formData.category_id || null,
          scheduled_at: formData.scheduled_at || null,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          keywords: formData.keywords?.length ? formData.keywords : null,
        } as any)
        .eq("id", postId);

      if (error) throw error;
      toast({ title: "Success", description: "Post updated successfully" });
      return true;
    } catch (err) {
      console.error("Error updating post:", err);
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("news_posts").delete().eq("id", postId);
      if (error) throw error;
      toast({ title: "Deleted", description: "Post deleted successfully" });
      return true;
    } catch (err) {
      console.error("Error deleting post:", err);
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
      return false;
    }
  };

  const approvePost = async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({ status: "approved", published_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw error;
      toast({ title: "Approved", description: "Post has been published" });
      return true;
    } catch (err) {
      console.error("Error approving post:", err);
      toast({ title: "Error", description: "Failed to approve post", variant: "destructive" });
      return false;
    }
  };

  const rejectPost = async (postId: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({ status: "rejected", rejection_reason: reason })
        .eq("id", postId);
      if (error) throw error;
      toast({ title: "Rejected", description: "Post has been rejected" });
      return true;
    } catch (err) {
      console.error("Error rejecting post:", err);
      toast({ title: "Error", description: "Failed to reject post", variant: "destructive" });
      return false;
    }
  };

  const archivePost = async (postId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("news_posts")
        .update({ status: "archived" } as any)
        .eq("id", postId);
      if (error) throw error;
      toast({ title: "Archived", description: "Post has been archived" });
      return true;
    } catch (err) {
      console.error("Error archiving post:", err);
      toast({ title: "Error", description: "Failed to archive post", variant: "destructive" });
      return false;
    }
  };

  const vote = async (postId: string, userId: string, voteType: 1 | -1): Promise<boolean> => {
    try {
      const { data: existingVote } = await supabase
        .from("post_votes")
        .select("id, vote_type")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase.from("post_votes").delete().eq("id", existingVote.id);
        } else {
          await supabase.from("post_votes").update({ vote_type: voteType }).eq("id", existingVote.id);
        }
      } else {
        await supabase.from("post_votes").insert({ post_id: postId, user_id: userId, vote_type: voteType });
      }
      return true;
    } catch (err) {
      console.error("Error voting:", err);
      toast({ title: "Error", description: "Failed to vote", variant: "destructive" });
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

      const enriched = await Promise.all(
        (comments || []).map(async (comment) => {
          const { data: author } = await supabase
            .from("public_profiles" as any)
            .select("full_name, avatar_url")
            .eq("id", comment.user_id)
            .single() as any;
          return { ...comment, author: author || undefined };
        })
      );
      return enriched;
    } catch (err) {
      console.error("Error loading comments:", err);
      return [];
    }
  };

  const addComment = async (postId: string, userId: string, content: string, parentId?: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId || null,
      });
      if (error) throw error;
      toast({ title: "Comment Added", description: "Your comment has been posted" });
      return true;
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
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
    loadAllPosts,
    loadPost,
    loadRelatedPosts,
    createPost,
    updatePost,
    deletePost,
    approvePost,
    rejectPost,
    archivePost,
    vote,
    loadComments,
    addComment,
    deleteComment,
  };
};
