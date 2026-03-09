import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ResearchSubmission {
  id: string;
  user_id: string;
  title: string;
  author_name: string;
  institution: string | null;
  email: string;
  category: string;
  abstract: string;
  tags: string[];
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  supporting_images: string[];
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchFormData {
  title: string;
  author_name: string;
  institution: string;
  email: string;
  category: string;
  abstract: string;
  tags: string[];
}

export const RESEARCH_CATEGORIES = [
  "Energy policy",
  "Solar energy",
  "Electric vehicles",
  "Energy storage",
  "Clean cooking",
  "Energy access",
  "Climate technology",
];

export const usePublishedResearch = () => {
  return useQuery({
    queryKey: ["published-research"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_submissions")
        .select("*")
        .eq("status", "approved")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ResearchSubmission[];
    },
  });
};

export const useMyResearch = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-research", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("research_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ResearchSubmission[];
    },
    enabled: !!user,
  });
};

export const useAllResearch = () => {
  return useQuery({
    queryKey: ["all-research"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ResearchSubmission[];
    },
  });
};

export const useSubmitResearch = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      file,
    }: {
      formData: ResearchFormData;
      file: File | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("research-files")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("research-files")
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { error } = await supabase.from("research_submissions").insert({
        user_id: user.id,
        title: formData.title,
        author_name: formData.author_name,
        institution: formData.institution || null,
        email: formData.email,
        category: formData.category,
        abstract: formData.abstract,
        tags: formData.tags,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      });

      if (error) throw error;

      // Notify admin
      try {
        const { data: admins } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (admins) {
          const notifications = admins.map((a) => ({
            user_id: a.user_id,
            type: "research_submission",
            title: "New Research Submission",
            message: `"${formData.title}" by ${formData.author_name} is awaiting review.`,
            reference_type: "research",
          }));
          await supabase.from("notifications").insert(notifications);
        }
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
    },
    onSuccess: () => {
      toast({ title: "Submitted!", description: "Your research has been submitted for review." });
      queryClient.invalidateQueries({ queryKey: ["my-research"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to submit", variant: "destructive" });
    },
  });
};
