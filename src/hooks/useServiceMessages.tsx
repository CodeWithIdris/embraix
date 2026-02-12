import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type ServiceMessage = Database["public"]["Tables"]["service_messages"]["Row"];

export const useServiceMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all messages for current user
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["service-messages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("service_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ServiceMessage[];
    },
    enabled: !!user,
  });

  // Fetch conversation with a specific user
  const useConversation = (otherUserId: string) => {
    return useQuery({
      queryKey: ["conversation", user?.id, otherUserId],
      queryFn: async () => {
        if (!user) return [];
        const { data, error } = await supabase
          .from("service_messages")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order("created_at", { ascending: true });

        if (error) throw error;
        return data as ServiceMessage[];
      },
      enabled: !!user && !!otherUserId,
    });
  };

  // Get unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from("service_messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Send message with email notification
  const sendMessage = useMutation({
    mutationFn: async (messageData: Database["public"]["Tables"]["service_messages"]["Insert"]) => {
      const { data, error } = await supabase
        .from("service_messages")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["service-messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.id, data.recipient_id] });
      
      // Send email notification to recipient
      try {
        // Get recipient's email from profiles
        const { data: recipientProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", data.recipient_id)
          .single();
        
        // Get sender's name
        const { data: senderProfile } = await supabase
          .from("public_profiles" as any)
          .select("full_name")
          .eq("id", data.sender_id)
          .single() as { data: { full_name: string | null } | null };
        
        if (recipientProfile?.email) {
          const baseUrl = window.location.origin;
          const preview = data.content.length > 100 
            ? data.content.substring(0, 100) + "..." 
            : data.content;
          
          await supabase.functions.invoke("send-notification-email", {
            body: {
              type: "new_service_message",
              recipientEmail: recipientProfile.email,
              recipientName: recipientProfile.full_name || undefined,
              data: {
                senderName: senderProfile?.full_name || "A user",
                subject: data.subject || undefined,
                preview,
                inboxUrl: `${baseUrl}/centre/dashboard`,
              },
            },
          });
        }
      } catch (emailError) {
        console.error("Failed to send message notification email:", emailError);
        // Don't fail the mutation if email fails
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark message as read
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("service_messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("service-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["service-messages"] });
          queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
          toast({
            title: "New Message",
            description: "You have a new message from a service provider.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, toast]);

  return {
    messages,
    messagesLoading,
    unreadCount,
    useConversation,
    sendMessage,
    markAsRead,
  };
};
