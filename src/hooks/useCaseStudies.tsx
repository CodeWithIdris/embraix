import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CaseStudy {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  story_type: "community_story" | "case_study" | "energy_project" | "impact_story";
  location: string | null;
  category: string | null;
  excerpt: string | null;
  problem: string | null;
  solution: string | null;
  implementation: string | null;
  impact: string | null;
  content: string | null;
  featured_image: string | null;
  images: string[] | null;
  video_url: string | null;
  documentation_urls: string[] | null;
  author_name: string | null;
  organization: string | null;
  project_date: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const storyTypeLabels: Record<string, string> = {
  community_story: "Community Story",
  case_study: "Case Study",
  energy_project: "Energy Project",
  impact_story: "Impact Story",
};

export const getStoryTypeLabel = (type: string) => storyTypeLabels[type] || type;

export const usePublishedCaseStudies = (storyType?: string) => {
  return useQuery({
    queryKey: ["case-studies", "published", storyType],
    queryFn: async () => {
      let query = supabase
        .from("case_studies")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (storyType && storyType !== "all") {
        query = query.eq("story_type", storyType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CaseStudy[];
    },
  });
};

export const useCaseStudy = (slug: string) => {
  return useQuery({
    queryKey: ["case-study", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_studies")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      return data as CaseStudy;
    },
    enabled: !!slug,
  });
};
