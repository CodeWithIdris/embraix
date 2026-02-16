import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ExpertChat {
  id: string;
  client_id: string;
  expert_id: string | null;
  expertise_area: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface ExpertChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const useExpertChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<ExpertChat[]>([]);
  const [messages, setMessages] = useState<ExpertChatMessage[]>([]);
  const [activeChat, setActiveChat] = useState<ExpertChat | null>(null);
  const [loading, setLoading] = useState(false);

  const loadChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("expert_chats")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setChats((data || []) as ExpertChat[]);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from("expert_chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ExpertChatMessage[]);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, []);

  const createChat = useCallback(async (expertiseArea: string, subject: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("expert_chats")
        .insert({
          client_id: user.id,
          expertise_area: expertiseArea,
          subject,
          status: "waiting",
        })
        .select()
        .single();

      if (error) throw error;
      const chat = data as ExpertChat;
      setChats(prev => [chat, ...prev]);

      // Auto-assign an available expert
      try {
        const { data: assignResult } = await supabase.functions.invoke("assign-expert", {
          body: { chat_id: chat.id },
        });
        if (assignResult?.assigned && assignResult?.expert_id) {
          const updatedChat = { ...chat, expert_id: assignResult.expert_id, status: "active" };
          setChats(prev => prev.map(c => c.id === chat.id ? updatedChat : c));
          return updatedChat;
        }
      } catch (assignErr) {
        console.error("Auto-assign failed:", assignErr);
      }

      return chat;
    } catch (err) {
      console.error("Error creating chat:", err);
      toast({ title: "Error", description: "Failed to start chat", variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const sendMessage = useCallback(async (chatId: string, content: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("expert_chat_messages")
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update chat timestamp
      await supabase
        .from("expert_chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chatId);

      return data as ExpertChatMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const claimChat = useCallback(async (chatId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("expert_chats")
        .update({ expert_id: user.id, status: "active" })
        .eq("id", chatId);

      if (error) throw error;
      setChats(prev =>
        prev.map(c => c.id === chatId ? { ...c, expert_id: user.id, status: "active" } : c)
      );
      if (activeChat?.id === chatId) {
        setActiveChat(prev => prev ? { ...prev, expert_id: user.id, status: "active" } : prev);
      }
      return true;
    } catch (err) {
      console.error("Error claiming chat:", err);
      return false;
    }
  }, [user, activeChat]);

  const closeChat = useCallback(async (chatId: string) => {
    try {
      const { error } = await supabase
        .from("expert_chats")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", chatId);

      if (error) throw error;
      setChats(prev =>
        prev.map(c => c.id === chatId ? { ...c, status: "closed" } : c)
      );
      return true;
    } catch (err) {
      console.error("Error closing chat:", err);
      return false;
    }
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesChannel = supabase
      .channel("expert_chat_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "expert_chat_messages" },
        (payload) => {
          const newMsg = payload.new as ExpertChatMessage;
          setMessages(prev => {
            if (prev.length > 0 && prev[0].chat_id === newMsg.chat_id) {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            }
            return prev;
          });
        }
      )
      .subscribe();

    const chatsChannel = supabase
      .channel("expert_chats_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expert_chats" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setChats(prev => {
              if (prev.find(c => c.id === (payload.new as ExpertChat).id)) return prev;
              return [payload.new as ExpertChat, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as ExpertChat;
            setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
            if (activeChat?.id === updated.id) {
              setActiveChat(updated);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  }, [user, activeChat?.id]);

  return {
    chats,
    messages,
    activeChat,
    setActiveChat,
    loading,
    loadChats,
    loadMessages,
    createChat,
    sendMessage,
    claimChat,
    closeChat,
  };
};
