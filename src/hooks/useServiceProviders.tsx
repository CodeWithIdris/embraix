import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];
type ServiceListing = Database["public"]["Tables"]["service_listings"]["Row"];
type ProviderProject = Database["public"]["Tables"]["provider_projects"]["Row"];
type ProviderReview = Database["public"]["Tables"]["provider_reviews"]["Row"];
type ServiceCategory = Database["public"]["Enums"]["service_category"];

export const useServiceProviders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["service-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("status", "active")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data as ServiceProvider[];
    },
  });

  // Fetch current user's provider profile
  const { data: myProvider, isLoading: myProviderLoading } = useQuery({
    queryKey: ["my-provider", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceProvider | null;
    },
    enabled: !!user,
  });

  // Fetch a specific provider by ID
  const useProvider = (providerId: string) => {
    return useQuery({
      queryKey: ["provider", providerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("service_providers")
          .select("*")
          .eq("id", providerId)
          .single();

        if (error) throw error;
        return data as ServiceProvider;
      },
      enabled: !!providerId,
    });
  };

  // Fetch listings for a provider
  const useProviderListings = (providerId: string) => {
    return useQuery({
      queryKey: ["provider-listings", providerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("service_listings")
          .select("*")
          .eq("provider_id", providerId)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ServiceListing[];
      },
      enabled: !!providerId,
    });
  };

  // Fetch projects for a provider
  const useProviderProjects = (providerId: string) => {
    return useQuery({
      queryKey: ["provider-projects", providerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("provider_projects")
          .select("*")
          .eq("provider_id", providerId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ProviderProject[];
      },
      enabled: !!providerId,
    });
  };

  // Fetch reviews for a provider
  const useProviderReviews = (providerId: string) => {
    return useQuery({
      queryKey: ["provider-reviews", providerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("provider_reviews")
          .select("*")
          .eq("provider_id", providerId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ProviderReview[];
      },
      enabled: !!providerId,
    });
  };

  // Search listings
  const useSearchListings = (query: string, category?: ServiceCategory) => {
    return useQuery({
      queryKey: ["search-listings", query, category],
      queryFn: async () => {
        let queryBuilder = supabase
          .from("service_listings")
          .select(`
            *,
            service_providers!inner(*)
          `)
          .eq("is_active", true);

        if (category) {
          queryBuilder = queryBuilder.eq("category", category);
        }

        if (query) {
          queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
        }

        const { data, error } = await queryBuilder.order("is_featured", { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  };

  // Create provider profile
  const createProvider = useMutation({
    mutationFn: async (providerData: Database["public"]["Tables"]["service_providers"]["Insert"]) => {
      const { data, error } = await supabase
        .from("service_providers")
        .insert(providerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider"] });
      toast({
        title: "Profile Created",
        description: "Your service provider profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update provider profile
  const updateProvider = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceProvider> & { id: string }) => {
      const { data, error } = await supabase
        .from("service_providers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-provider"] });
      queryClient.invalidateQueries({ queryKey: ["service-providers"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  // Create listing
  const createListing = useMutation({
    mutationFn: async (listingData: Database["public"]["Tables"]["service_listings"]["Insert"]) => {
      const { data, error } = await supabase
        .from("service_listings")
        .insert(listingData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider-listings", data.provider_id] });
      toast({
        title: "Listing Created",
        description: "Your service listing has been created successfully.",
      });
    },
  });

  // Create project
  const createProject = useMutation({
    mutationFn: async (projectData: Database["public"]["Tables"]["provider_projects"]["Insert"]) => {
      const { data, error } = await supabase
        .from("provider_projects")
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider-projects", data.provider_id] });
      toast({
        title: "Project Added",
        description: "Your project has been added to your portfolio.",
      });
    },
  });

  // Create review
  const createReview = useMutation({
    mutationFn: async (reviewData: Database["public"]["Tables"]["provider_reviews"]["Insert"]) => {
      const { data, error } = await supabase
        .from("provider_reviews")
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider-reviews", data.provider_id] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      });
    },
  });

  return {
    providers,
    providersLoading,
    myProvider,
    myProviderLoading,
    useProvider,
    useProviderListings,
    useProviderProjects,
    useProviderReviews,
    useSearchListings,
    createProvider,
    updateProvider,
    createListing,
    createProject,
    createReview,
  };
};

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; icon: string }[] = [
  { value: "consultation", label: "Consultation", icon: "💬" },
  { value: "installation", label: "Installation", icon: "🔧" },
  { value: "repair", label: "Repair", icon: "🛠️" },
  { value: "sales", label: "Sales", icon: "🛒" },
  { value: "maintenance", label: "Maintenance", icon: "⚙️" },
  { value: "training", label: "Training", icon: "📚" },
  { value: "other", label: "Other", icon: "📦" },
];
