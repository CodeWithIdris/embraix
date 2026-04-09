import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import TypingIndicator from "@/components/chat/TypingIndicator";
import FollowUpSuggestions from "@/components/chat/FollowUpSuggestions";
import ConversationSidebar from "@/components/chat/ConversationSidebar";
import MessageFeedback from "@/components/chat/MessageFeedback";
import EmojiReactions from "@/components/chat/EmojiReactions";
import ShareConversation from "@/components/chat/ShareConversation";
import StreamingText from "@/components/chat/StreamingText";
import VoiceInput from "@/components/chat/VoiceInput";
import UserPreferencesDialog from "@/components/chat/UserPreferencesDialog";
import ChatProductCards from "@/components/chat/ChatProductCards";
import AIWizard from "@/components/chat/AIWizard";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

// Feature mode welcome messages
const FEATURE_MODES: Record<string, { welcome: string; prompts: { icon: string; text: string }[] }> = {
  Recommendations: {
    welcome: "Tell me about your home and energy needs — I'll find the best solutions for you.",
    prompts: [
      { icon: "☀️", text: "Best solar panel for a 3-bedroom house" },
      { icon: "🔋", text: "Recommend a battery for nighttime backup" },
      { icon: "💡", text: "Which inverter fits a small business?" },
      { icon: "💰", text: "Most cost-effective solar setup" },
    ],
  },
  Calculators: {
    welcome: "Let's calculate your energy needs. What would you like to estimate?",
    prompts: [
      { icon: "📊", text: "Calculate my solar ROI over 5 years" },
      { icon: "💰", text: "How much can I save switching to solar?" },
      { icon: "⚡", text: "Size a solar system for my monthly usage" },
      { icon: "🔢", text: "Compare costs: solar vs generator" },
    ],
  },
  Diagnostics: {
    welcome: "What issue are you experiencing with your energy system?",
    prompts: [
      { icon: "🔧", text: "My inverter keeps beeping, what's wrong?" },
      { icon: "☀️", text: "Solar panels not producing enough power" },
      { icon: "🔋", text: "Battery not charging to full capacity" },
      { icon: "⚠️", text: "System shuts off during high load" },
    ],
  },
  Insights: {
    welcome: "What kind of energy insights are you looking for?",
    prompts: [
      { icon: "📈", text: "What's trending in African solar market?" },
      { icon: "🚗", text: "Latest EV adoption trends in Nigeria" },
      { icon: "📋", text: "New clean energy policies in 2026" },
      { icon: "🌍", text: "Global battery technology breakthroughs" },
    ],
  },
  Assistance: {
    welcome: "I can help you with installation or purchase. What do you need?",
    prompts: [
      { icon: "🏠", text: "Help me plan a solar installation" },
      { icon: "👷", text: "Find an installer in Lagos" },
      { icon: "📝", text: "What do I need to start going solar?" },
      { icon: "🔌", text: "Steps to set up EV charging at home" },
    ],
  },
};

const DEFAULT_PROMPTS = [
  { icon: "☀️", text: "Best solar setup for my home?" },
  { icon: "🚗", text: "Help me choose an EV" },
  { icon: "🔋", text: "Battery storage options" },
  { icon: "💰", text: "Solar installation costs" },
];

// Extract [PRODUCTS:slug1,slug2] markers from content
const extractProductSlugs = (content: string): string[] => {
  const match = content.match(/\[PRODUCTS:([\w\-,]+)\]/);
  if (!match) return [];
  return match[1].split(",").map(s => s.trim()).filter(Boolean);
};

// Remove product markers from display content
const cleanContent = (content: string): string => {
  return content.replace(/\[PRODUCTS:[\w\-,]+\]/g, "").trim();
};

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [hasTrackedFirstMessage, setHasTrackedFirstMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(() => {
    const mode = new URLSearchParams(window.location.search).get("mode");
    return mode === "Recommendations" || mode === "wizard";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    createConversation,
    deleteConversation,
    renameConversation,
    featureMode,
    setFeatureMode,
  } = useChat();

  // Capture mode and query from URL on mount
  const [initialQuery] = useState<string | null>(() => {
    const q = searchParams.get("q");
    return q ? decodeURIComponent(q) : null;
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode) {
      setFeatureMode(decodeURIComponent(mode));
    }
    if (mode || initialQuery) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Auto-send initial query
  useEffect(() => {
    if (initialQuery && user && !authLoading && messages.length === 0 && !isStreaming) {
      handleSend(initialQuery);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && user && messages.length === 0) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [authLoading, user, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendAIConsultWelcome = async () => {
    if (!user || hasTrackedFirstMessage) return;
    try {
      const { data: existing } = await supabase
        .from("newsletter_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("source", "ai_consult")
        .maybeSingle();

      if (!existing) {
        await supabase.functions.invoke("send-welcome-email", {
          body: {
            email: user.email,
            name: user.user_metadata?.full_name || "",
            source: "ai_consult",
            userId: user.id,
          },
        });
      }
      setHasTrackedFirstMessage(true);
    } catch (err) {
      console.error("Failed to send AI consult welcome:", err);
    }
  };

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim() || isStreaming) return;
    setInput("");
    if (messages.length === 0) sendAIConsultWelcome();
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setFeatureMode(null);
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
  };

  const lastMessage = messages[messages.length - 1];
  const showFollowUp = lastMessage?.role === "assistant" && lastMessage.content && !isStreaming;
  const currentConvData = conversations.find(c => c.id === currentConversation);

  // Get active mode config
  const modeConfig = featureMode ? FEATURE_MODES[featureMode] : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const SidebarContent = (
    <ConversationSidebar
      conversations={conversations}
      currentConversation={currentConversation}
      onSelect={setCurrentConversation}
      onCreate={handleNewConversation}
      onDelete={deleteConversation}
      onRename={renameConversation}
      onClose={() => setMobileSheetOpen(false)}
      isMobile
    />
  );

  return (
    <>
      <Helmet>
        <title>Embraix AI | Smart Energy Assistant</title>
        <meta name="description" content="Get expert AI-powered advice on clean energy, EVs, and sustainable technologies." />
      </Helmet>

      <Header />

      <div className="h-screen pt-16 md:pt-18 flex bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <div
          className={`hidden md:block transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          } overflow-hidden flex-shrink-0`}
        >
          <div className="w-72 h-full">
            <ConversationSidebar
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={setCurrentConversation}
              onCreate={handleNewConversation}
              onDelete={deleteConversation}
              onRename={renameConversation}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 flex-shrink-0">
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {SidebarContent}
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex h-8 w-8"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-sm text-foreground">Embraix AI</h1>
                <p className="text-[11px] text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ShareConversation messages={messages} title={currentConvData?.title} />
              {user && <UserPreferencesDialog userId={user.id} />}
            </div>
          </header>

          {/* Messages — scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mb-5">
                  <Bot className="w-7 h-7 text-primary-foreground" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  {modeConfig ? `${featureMode}` : "How can I help you today?"}
                </h2>
                <p className="text-muted-foreground text-sm max-w-md mb-8">
                  {modeConfig
                    ? modeConfig.welcome
                    : "Ask about clean energy, EVs, solar, or smart tech. I'll keep it short and useful."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
                  {(modeConfig ? modeConfig.prompts : DEFAULT_PROMPTS).map((prompt, i) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="text-left p-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      <span className="mr-2">{prompt.icon}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message, index) => {
                  const productSlugs = message.role === "assistant" ? extractProductSlugs(message.content) : [];
                  const displayContent = message.role === "assistant" ? cleanContent(message.content) : message.content;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""} animate-fade-in`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary/10 rounded-tr-sm"
                            : "bg-secondary/50 rounded-tl-sm"
                        }`}
                      >
                        <div className="text-sm text-foreground font-body leading-relaxed">
                          {displayContent ? (
                            message.role === "assistant" ? (
                              <StreamingText
                                content={displayContent}
                                isComplete={!isStreaming || index !== messages.length - 1}
                              />
                            ) : (
                              <p>{displayContent}</p>
                            )
                          ) : (
                            <TypingIndicator />
                          )}
                        </div>

                        {/* Product cards */}
                        {message.role === "assistant" && productSlugs.length > 0 && (
                          <ChatProductCards slugs={productSlugs} />
                        )}

                        {/* Emoji Reactions + Feedback */}
                        {message.role === "assistant" && message.content && !isStreaming && user && currentConversation && (
                          <div className="flex items-center gap-2 mt-1">
                            <EmojiReactions messageId={message.id} />
                            <MessageFeedback
                              messageId={message.id}
                              conversationId={currentConversation}
                              userId={user.id}
                            />
                          </div>
                        )}

                        {/* Dynamic follow-up suggestions */}
                        {message.role === "assistant" && index === messages.length - 1 && showFollowUp && (
                          <FollowUpSuggestions
                            onSelect={(suggestion) => handleSend(suggestion)}
                            disabled={isStreaming}
                            lastMessage={message.content}
                          />
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-[10px] font-medium text-foreground">
                            {user?.email?.[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area — sticky at bottom */}
          <div className="flex-shrink-0 p-3 border-t border-border/50 bg-background">
            <div className="max-w-3xl mx-auto flex gap-2 items-center">
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isStreaming} />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about clean energy, EVs, or smart tech..."
                className="flex-1 bg-secondary/50 border-border/50 h-10"
                disabled={isStreaming}
                autoFocus
              />
              <Button
                onClick={() => handleSend()}
                variant="hero"
                size="icon"
                className="h-10 w-10"
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
              Embraix AI may produce inaccurate information. Verify important details.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
