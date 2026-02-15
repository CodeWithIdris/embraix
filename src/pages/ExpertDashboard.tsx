import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Send,
  Clock,
  CheckCircle2,
  MessageSquare,
  Loader2,
  ArrowLeft,
  LogIn,
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useExpertChat, ExpertChat } from "@/hooks/useExpertChat";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isExpert, isAdmin } = useAuth();
  const {
    chats,
    messages,
    activeChat,
    setActiveChat,
    loading,
    loadChats,
    loadMessages,
    sendMessage,
    claimChat,
    closeChat,
  } = useExpertChat();

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && user && !isExpert && !isAdmin) navigate("/");
  }, [user, authLoading, isExpert, isAdmin, navigate]);

  useEffect(() => {
    if (user && (isExpert || isAdmin)) loadChats();
  }, [user, isExpert, isAdmin, loadChats]);

  useEffect(() => {
    if (activeChat) loadMessages(activeChat.id);
  }, [activeChat, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);
    await sendMessage(activeChat.id, newMessage.trim());
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClaim = async (chat: ExpertChat) => {
    const success = await claimChat(chat.id);
    if (success) setActiveChat({ ...chat, expert_id: user!.id, status: "active" });
  };

  // Show waiting chats and chats assigned to this expert
  const waitingChats = chats.filter(c => c.status === "waiting");
  const myActiveChats = chats.filter(c => c.expert_id === user?.id && c.status === "active");
  const myClosedChats = chats.filter(c => c.expert_id === user?.id && c.status === "closed");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Expert Dashboard - Embraix</title>
      </Helmet>

      <Header />

      <main className="min-h-screen pt-20 pb-0 bg-background">
        <div className="container mx-auto px-4 h-[calc(100vh-5rem)]">
          <div className="flex h-full gap-0 border border-border/50 rounded-xl overflow-hidden bg-card">
            {/* Sidebar */}
            <div className="w-80 border-r border-border/50 flex flex-col shrink-0 hidden md:flex">
              <div className="p-4 border-b border-border/50">
                <h2 className="font-display font-bold text-lg">Expert Panel</h2>
                <p className="text-xs text-muted-foreground">Manage client consultations</p>
              </div>

              <ScrollArea className="flex-1">
                {/* Waiting */}
                {waitingChats.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                      Waiting ({waitingChats.length})
                    </div>
                    {waitingChats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors border-b border-border/20 ${
                          activeChat?.id === chat.id ? "bg-secondary/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate pr-2">{chat.subject}</span>
                          <Badge variant="outline" className="text-amber-500 border-amber-500 text-xs shrink-0">
                            <Clock className="w-3 h-3 mr-1" />New
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{chat.expertise_area.replace("-", " ")}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Active */}
                {myActiveChats.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                      Active ({myActiveChats.length})
                    </div>
                    {myActiveChats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors border-b border-border/20 ${
                          activeChat?.id === chat.id ? "bg-secondary/50" : ""
                        }`}
                      >
                        <span className="font-medium text-sm truncate block">{chat.subject}</span>
                        <p className="text-xs text-muted-foreground capitalize">{chat.expertise_area.replace("-", " ")}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Closed */}
                {myClosedChats.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                      Closed ({myClosedChats.length})
                    </div>
                    {myClosedChats.slice(0, 10).map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors border-b border-border/20 opacity-60 ${
                          activeChat?.id === chat.id ? "bg-secondary/50 opacity-100" : ""
                        }`}
                      >
                        <span className="font-medium text-sm truncate block">{chat.subject}</span>
                        <p className="text-xs text-muted-foreground">Closed</p>
                      </button>
                    ))}
                  </div>
                )}

                {chats.length === 0 && !loading && (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No chats yet</p>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {activeChat ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setActiveChat(null)}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <h3 className="font-semibold text-sm truncate">{activeChat.subject}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{activeChat.expertise_area.replace("-", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeChat.status === "waiting" && (
                        <Button size="sm" variant="hero" onClick={() => handleClaim(activeChat)}>
                          <LogIn className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      )}
                      {activeChat.status === "active" && (
                        <Button size="sm" variant="ghost" onClick={() => closeChat(activeChat.id)}>
                          Close
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3 max-w-2xl mx-auto">
                      {messages.map(msg => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-secondary/50 text-foreground rounded-bl-md"
                            }`}>
                              {!isMe && <p className="text-xs font-medium text-primary mb-1">Client</p>}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {format(new Date(msg.created_at), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input - only if active and claimed by this expert */}
                  {activeChat.status === "active" && activeChat.expert_id === user?.id && (
                    <div className="p-4 border-t border-border/50">
                      <div className="flex gap-2 max-w-2xl mx-auto">
                        <Input
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Reply to client..."
                          disabled={sending}
                          className="flex-1"
                        />
                        <Button onClick={handleSend} disabled={!newMessage.trim() || sending} variant="hero" size="icon">
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display font-bold text-lg mb-2">Expert Panel</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a chat to respond to clients.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ExpertDashboard;
