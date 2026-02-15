import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Send,
  Clock,
  CheckCircle2,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useExpertChat, ExpertChat, ExpertChatMessage } from "@/hooks/useExpertChat";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const expertiseAreas = [
  { value: "solar", label: "Solar Energy & Installation" },
  { value: "ev", label: "Electric Vehicles & Charging" },
  { value: "smart-home", label: "Smart Home Technologies" },
  { value: "battery", label: "Battery Storage Solutions" },
  { value: "energy-audit", label: "Energy Audits & Efficiency" },
  { value: "commercial", label: "Commercial Projects" },
  { value: "other", label: "Other" },
];

const ConsultExpert = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    chats,
    messages,
    activeChat,
    setActiveChat,
    loading,
    loadChats,
    loadMessages,
    createChat,
    sendMessage,
    closeChat,
  } = useExpertChat();

  const [newMessage, setNewMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  useEffect(() => {
    if (activeChat) loadMessages(activeChat.id);
  }, [activeChat, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateChat = async () => {
    if (!newSubject.trim() || !newExpertise) return;
    const chat = await createChat(newExpertise, newSubject.trim());
    if (chat) {
      setActiveChat(chat);
      setShowNewChat(false);
      setNewSubject("");
      setNewExpertise("");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat || sending) return;
    setSending(true);
    await sendMessage(activeChat.id, newMessage.trim());
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 text-xs"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>;
      case "active":
        return <Badge variant="outline" className="text-green-500 border-green-500 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case "closed":
        return <Badge variant="outline" className="text-muted-foreground text-xs">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const myChats = chats.filter(c => c.client_id === user?.id);

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
        <title>Consult an Expert - Embraix</title>
        <meta name="description" content="Chat live with certified industry specialists for personalized consultation." />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-20 pb-0 bg-background">
        <div className="container mx-auto px-4 h-[calc(100vh-5rem)]">
          <div className="flex h-full gap-0 border border-border/50 rounded-xl overflow-hidden bg-card">
            {/* Sidebar - Chat list */}
            <div className="w-80 border-r border-border/50 flex flex-col shrink-0 hidden md:flex">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-bold text-lg">Expert Chat</h2>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewChat(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Live chat with specialists</p>
              </div>

              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : myChats.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                    <Button size="sm" variant="hero" className="mt-3" onClick={() => setShowNewChat(true)}>
                      Start a Chat
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {myChats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => { setActiveChat(chat); setShowNewChat(false); }}
                        className={`w-full text-left p-4 hover:bg-secondary/30 transition-colors ${
                          activeChat?.id === chat.id ? "bg-secondary/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate pr-2">{chat.subject}</span>
                          {getStatusBadge(chat.status)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{chat.expertise_area.replace("-", " ")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(chat.created_at), "MMM d, h:mm a")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
              {showNewChat ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Card className="w-full max-w-md border-border/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          New Consultation
                        </CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => setShowNewChat(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-sm">
                        Start a live chat with an available expert.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Topic *</Label>
                        <Select value={newExpertise} onValueChange={setNewExpertise}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select expertise area" />
                          </SelectTrigger>
                          <SelectContent>
                            {expertiseAreas.map(a => (
                              <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Subject *</Label>
                        <Input
                          value={newSubject}
                          onChange={e => setNewSubject(e.target.value)}
                          placeholder="Brief description of your question"
                          maxLength={200}
                        />
                      </div>
                      <Button
                        variant="hero"
                        className="w-full"
                        onClick={handleCreateChat}
                        disabled={!newSubject.trim() || !newExpertise}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : activeChat ? (
                <>
                  {/* Chat header */}
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setActiveChat(null)}>
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{activeChat.subject}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {activeChat.expertise_area.replace("-", " ")} · {activeChat.status === "waiting" ? "Waiting for expert..." : activeChat.status === "active" ? "Expert connected" : "Closed"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activeChat.status)}
                      {activeChat.status !== "closed" && (
                        <Button size="sm" variant="ghost" onClick={() => closeChat(activeChat.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {activeChat.status === "waiting" && messages.length === 0 && (
                      <div className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">Waiting for an expert to join...</p>
                        <p className="text-xs text-muted-foreground mt-1">You can send your first message while you wait.</p>
                      </div>
                    )}

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
                              {!isMe && (
                                <p className="text-xs font-medium text-primary mb-1">Expert</p>
                              )}
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

                  {/* Message input */}
                  {activeChat.status !== "closed" && (
                    <div className="p-4 border-t border-border/50">
                      <div className="flex gap-2 max-w-2xl mx-auto">
                        <Input
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type your message..."
                          disabled={sending}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          variant="hero"
                          size="icon"
                        >
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
                    <h3 className="font-display font-bold text-lg mb-2">Expert Consultation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a conversation or start a new one.
                    </p>
                    <Button variant="hero" onClick={() => setShowNewChat(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
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

export default ConsultExpert;
