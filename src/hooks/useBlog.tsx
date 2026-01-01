import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  status: "draft" | "pending" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  author?: { full_name: string | null; email: string | null };
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_id: string;
  tag_ids: string[];
  status: "draft" | "pending" | "published";
}

export const useBlog = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("tags").select("*").order("name")
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
    } catch (err) {
      console.error("Error loading categories/tags:", err);
    }
  };

  const loadArticles = async (filters?: { status?: string; authorId?: string }) => {
    setLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select(`
          *,
          category:categories(*)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.authorId) {
        query = query.eq("author_id", filters.authorId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Load tags and author for each article
      const articlesWithDetails = await Promise.all(
        (data || []).map(async (article) => {
          const [tagRes, authorRes] = await Promise.all([
            supabase.from("article_tags").select("tag:tags(*)").eq("article_id", article.id),
            article.author_id 
              ? supabase.from("profiles").select("full_name, email").eq("id", article.author_id).maybeSingle()
              : Promise.resolve({ data: null })
          ]);
          
          return {
            ...article,
            tags: tagRes.data?.map(t => t.tag).filter(Boolean) || [],
            author: authorRes.data
          } as Article;
        })
      );

      return articlesWithDetails;
    } catch (err) {
      console.error("Error loading articles:", err);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadArticle = async (id: string): Promise<Article | null> => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select(`*, category:categories(*)`)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const [tagRes, authorRes] = await Promise.all([
        supabase.from("article_tags").select("tag:tags(*)").eq("article_id", id),
        data.author_id 
          ? supabase.from("profiles").select("full_name, email").eq("id", data.author_id).maybeSingle()
          : Promise.resolve({ data: null })
      ]);

      return {
        ...data,
        tags: tagRes.data?.map(t => t.tag).filter(Boolean) || [],
        author: authorRes.data
      } as Article;
    } catch (err) {
      console.error("Error loading article:", err);
      return null;
    }
  };

  const createArticle = async (formData: ArticleFormData, authorId: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          featured_image: formData.featured_image || null,
          category_id: formData.category_id || null,
          author_id: authorId,
          status: formData.status,
          published_at: formData.status === "published" ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      // Add tags
      if (formData.tag_ids.length > 0) {
        await supabase.from("article_tags").insert(
          formData.tag_ids.map(tagId => ({
            article_id: data.id,
            tag_id: tagId
          }))
        );
      }

      toast({ title: "Success", description: "Article created successfully" });
      return data;
    } catch (err: unknown) {
      console.error("Error creating article:", err);
      const message = err instanceof Error ? err.message : "Failed to create article";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateArticle = async (id: string, formData: ArticleFormData) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          featured_image: formData.featured_image || null,
          category_id: formData.category_id || null,
          status: formData.status,
          published_at: formData.status === "published" ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) throw error;

      // Update tags
      await supabase.from("article_tags").delete().eq("article_id", id);
      
      if (formData.tag_ids.length > 0) {
        await supabase.from("article_tags").insert(
          formData.tag_ids.map(tagId => ({
            article_id: id,
            tag_id: tagId
          }))
        );
      }

      toast({ title: "Success", description: "Article updated successfully" });
      return true;
    } catch (err: unknown) {
      console.error("Error updating article:", err);
      const message = err instanceof Error ? err.message : "Failed to update article";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Article deleted successfully" });
      return true;
    } catch (err) {
      console.error("Error deleting article:", err);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
      return false;
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return {
    categories,
    tags,
    loading,
    loadArticles,
    loadArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    generateSlug,
    loadCategoriesAndTags
  };
};
