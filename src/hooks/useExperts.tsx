import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ExpertProfile {
  id: string;
  user_id: string;
  application_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  professional_title: string | null;
  expertise_areas: string[];
  experience_years: number | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  languages: string[] | null;
  linkedin: string | null;
  portfolio: string | null;
  avatar_url: string | null;
  hourly_rate: string | null;
  is_available: boolean;
  badges: string[] | null;
  certifications: string[] | null;
  rating: number;
  review_count: number;
  consultation_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationRequest {
  id: string;
  expert_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  topic: string;
  message: string;
  preferred_date: string | null;
  preferred_time: string | null;
  status: string;
  expert_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useExperts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active experts
  const { data: experts, isLoading: expertsLoading } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("status", "active")
        .eq("is_available", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      return data as ExpertProfile[];
    },
  });

  // Fetch current user's expert profile
  const { data: myExpertProfile, isLoading: myProfileLoading } = useQuery({
    queryKey: ["my-expert-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ExpertProfile | null;
    },
    enabled: !!user,
  });

  // Fetch consultation requests for an expert
  const useExpertRequests = (expertId?: string) => {
    return useQuery({
      queryKey: ["expert-requests", expertId],
      queryFn: async () => {
        if (!expertId) return [];
        const { data, error } = await supabase
          .from("consultation_requests")
          .select("*")
          .eq("expert_id", expertId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ConsultationRequest[];
      },
      enabled: !!expertId,
    });
  };

  // Fetch user's consultation requests
  const { data: myRequests, isLoading: myRequestsLoading } = useQuery({
    queryKey: ["my-consultation-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("consultation_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ConsultationRequest[];
    },
    enabled: !!user,
  });

  // Create expert profile from application
  const createExpertProfile = useMutation({
    mutationFn: async (profileData: Partial<ExpertProfile> & { user_id: string }) => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .insert(profileData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experts"] });
      queryClient.invalidateQueries({ queryKey: ["my-expert-profile"] });
    },
  });

  // Update expert profile
  const updateExpertProfile = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExpertProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experts"] });
      queryClient.invalidateQueries({ queryKey: ["my-expert-profile"] });
      toast({
        title: "Profile Updated",
        description: "Your expert profile has been updated successfully.",
      });
    },
  });

  // Respond to consultation request
  const respondToRequest = useMutation({
    mutationFn: async ({
      requestId,
      response,
      status,
    }: {
      requestId: string;
      response: string;
      status: "accepted" | "declined";
    }) => {
      const { data, error } = await supabase
        .from("consultation_requests")
        .update({
          status,
          expert_response: response,
          responded_at: new Date().toISOString(),
        } as any)
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expert-requests"] });
      toast({
        title: variables.status === "accepted" ? "Request Accepted" : "Request Declined",
        description: "The user has been notified of your response.",
      });
    },
  });

  return {
    experts,
    expertsLoading,
    myExpertProfile,
    myProfileLoading,
    myRequests,
    myRequestsLoading,
    useExpertRequests,
    createExpertProfile,
    updateExpertProfile,
    respondToRequest,
  };
};

export const EXPERTISE_OPTIONS = [
  { value: "solar", label: "Solar Energy & Installation" },
  { value: "ev", label: "Electric Vehicles & Charging" },
  { value: "smart-home", label: "Smart Home Technologies" },
  { value: "battery", label: "Battery Storage Solutions" },
  { value: "energy-audit", label: "Energy Audits & Efficiency" },
  { value: "commercial", label: "Commercial Projects" },
  { value: "mini-grid", label: "Mini-Grid Systems" },
  { value: "policy", label: "Energy Policy" },
  { value: "research", label: "Energy Research" },
  { value: "cooking", label: "Clean Cooking Solutions" },
];

export const BADGE_OPTIONS = [
  { value: "verified", label: "Verified Expert", icon: "CheckCircle2" },
  { value: "certified", label: "Certified Installer", icon: "Award" },
  { value: "researcher", label: "Energy Researcher", icon: "GraduationCap" },
];
