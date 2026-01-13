import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      setMessages(data?.map(m => ({
        ...m,
        role: m.role as "user" | "assistant"
      })) || []);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ user_id: user.id, title: "New Conversation" })
        .select()
        .single();
      
      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data.id);
      setMessages([]);
      return data.id;
    } catch (err) {
      console.error("Error creating conversation:", err);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;
    
    let convId = currentConversation;
    
    // Create conversation if none exists
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      // Save user message to database
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role: "user",
        content: content.trim()
      });

      // Update conversation title if first message
      if (messages.length === 0) {
        const title = content.trim().slice(0, 50) + (content.length > 50 ? "..." : "");
        await supabase
          .from("chat_conversations")
          .update({ title })
          .eq("id", convId);
        
        setConversations(prev => 
          prev.map(c => c.id === convId ? { ...c, title } : c)
        );
      }

      // Prepare messages for AI
      const aiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Get the current session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      // Call AI endpoint with streaming and proper auth
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ messages: aiMessages })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI service error");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      const assistantId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: assistantId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString()
      }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          textBuffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantId 
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      }

      // Save assistant message to database
      if (assistantContent) {
        await supabase.from("chat_messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: assistantContent
        });
      }

    } catch (err) {
      console.error("Chat error:", err);
      toast({
        title: "Chat Error",
        description: err instanceof Error ? err.message : "Failed to get response",
        variant: "destructive"
      });
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.content !== ""));
    } finally {
      setIsStreaming(false);
    }
  }, [user, currentConversation, messages, toast]);

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    createConversation,
    deleteConversation,
    loadConversations
  };
};
