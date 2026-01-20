import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useServiceMessages } from "@/hooks/useServiceMessages";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  ArrowLeft, 
  User,
  Check,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationPartner {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const MessagingInbox = () => {
  const { user } = useAuth();
  const { messages, markAsRead, sendMessage } = useServiceMessages();
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<{ name: string; id: string } | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation partners from messages
  const conversationPartners: ConversationPartner[] = messages?.reduce((acc: ConversationPartner[], msg) => {
    const partnerId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id;
    const existing = acc.find(p => p.id === partnerId);
    
    if (!existing) {
      const isUnread = !msg.is_read && msg.recipient_id === user?.id;
      acc.push({
        id: partnerId,
        name: "Loading...",
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unreadCount: isUnread ? 1 : 0,
      });
    } else {
      if (!msg.is_read && msg.recipient_id === user?.id) {
        existing.unreadCount++;
      }
    }
    
    return acc;
  }, []) || [];

  // Fetch partner names
  useEffect(() => {
    const fetchPartnerNames = async () => {
      for (const partner of conversationPartners) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", partner.id)
          .single();
        
        if (data) {
          partner.name = data.full_name || data.email || "Unknown";
        }
      }
    };
    
    if (conversationPartners.length > 0) {
      fetchPartnerNames();
    }
  }, [messages]);

  // Fetch selected partner info
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!selectedPartner) {
        setPartnerInfo(null);
        return;
      }
      
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", selectedPartner)
        .single();
      
      if (data) {
        setPartnerInfo({
          id: data.id,
          name: data.full_name || data.email || "Unknown",
        });
      }
    };
    
    fetchPartnerInfo();
  }, [selectedPartner]);

  // Get conversation messages
  const conversationMessages = messages?.filter(msg => 
    msg.sender_id === selectedPartner || msg.recipient_id === selectedPartner
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || [];

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedPartner && conversationMessages.length > 0) {
      conversationMessages.forEach(msg => {
        if (!msg.is_read && msg.recipient_id === user?.id) {
          markAsRead.mutate(msg.id);
        }
      });
    }
  }, [selectedPartner, conversationMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!user || !selectedPartner || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        sender_id: user.id,
        recipient_id: selectedPartner,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <Card className="gradient-card border-border/50">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 overflow-hidden">
      <div className="flex h-[500px]">
        {/* Conversation List */}
        <div className={cn(
          "w-full md:w-1/3 border-r border-border",
          selectedPartner && "hidden md:block"
        )}>
          <CardHeader className="border-b border-border py-3">
            <CardTitle className="font-display text-lg">Messages</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(500px-57px)]">
            {conversationPartners.length > 0 ? (
              <div className="divide-y divide-border">
                {conversationPartners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner.id)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-secondary/50 transition-colors flex items-start gap-3",
                      selectedPartner === partner.id && "bg-secondary/50"
                    )}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{partner.name}</p>
                        {partner.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {partner.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{partner.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(partner.lastMessageAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation View */}
        <div className={cn(
          "flex-1 flex flex-col",
          !selectedPartner && "hidden md:flex"
        )}>
          {selectedPartner && partnerInfo ? (
            <>
              {/* Header */}
              <div className="border-b border-border p-4 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedPartner(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{partnerInfo.name}</span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-4 py-2",
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          )}
                        >
                          {msg.subject && (
                            <p className="font-medium text-sm mb-1">{msg.subject}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className={cn(
                            "flex items-center gap-1 justify-end mt-1",
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            <span className="text-xs">
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                            {isMe && (
                              msg.is_read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                  />
                  <Button
                    variant="hero"
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MessagingInbox;
