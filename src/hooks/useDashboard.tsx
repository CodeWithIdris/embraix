import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [serviceReqs, consultations, savedProducts, downloads] = await Promise.all([
        supabase.from("consultation_tickets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("consultation_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("saved_products").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("reports_downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      return {
        serviceRequests: serviceReqs.count || 0,
        consultations: consultations.count || 0,
        savedProducts: savedProducts.count || 0,
        downloads: downloads.count || 0,
      };
    },
    enabled: !!user,
  });
};

export const useChatHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chat-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useServiceRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-service-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("consultation_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useConsultationRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-consultations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("consultation_requests")
        .select("*, expert_profiles(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useSavedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-products", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_products")
        .select("*, store_products(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useDownloadedReports = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["downloaded-reports", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reports_downloads")
        .select("*")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useUserNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};
