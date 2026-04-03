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

// AI Mode configurations for welcome messages
const AI_MODES: Record<string, { welcome: string; prompts: { icon: string; text: string }[] }> = {
  "Recommendations": {
    welcome: "I'll help you find the best clean energy solutions for your situation. What are you looking for?",
    prompts: [
      { icon: "☀️", text: "Best solar panel for a 3-bedroom house" },
      { icon: "🔋", text: "Recommend a battery for nighttime backup" },
      { icon: "💡", text: "Which inverter fits a small business?" },
      { icon: "💰", text: "Most cost-effective solar setup" },
    ],
  },
  "Tools & Calculators": {
    welcome: "I can help you calculate costs, ROI, and savings for clean energy systems. What would you like to estimate?",
    prompts: [
      { icon: "📊", text: "Calculate my solar ROI over 5 years" },
      { icon: "💰", text: "How much can I save switching to solar?" },
      { icon: "⚡", text: "Size a solar system for my monthly usage" },
      { icon: "🔢", text: "Compare costs: solar vs generator" },
    ],
  },
  "Diagnostics & Support": {
    welcome: "I can help you diagnose and fix issues with your energy system. What problem are you experiencing?",
    prompts: [
      { icon: "🔧", text: "My inverter keeps beeping, what's wrong?" },
      { icon: "☀️", text: "Solar panels not producing enough power" },
      { icon: "🔋", text: "Battery not charging to full capacity" },
      { icon: "⚠️", text: "System shuts off during high load" },
    ],
  },
  "Intelligence & Trends": {
    welcome: "I can share the latest trends and intelligence in clean energy. What topic interests you?",
    prompts: [
      { icon: "📈", text: "What's trending in African solar market?" },
      { icon: "🚗", text: "Latest EV adoption trends in Nigeria" },
      { icon: "📋", text: "New clean energy policies in 2026" },
      { icon: "🌍", text: "Global battery technology breakthroughs" },
    ],
  },
  "Actions & Execution": {
    welcome: "Ready to take action! I can help you plan installations, find providers, and scope your project. What do you need?",
    prompts: [
      { icon: "🏠", text: "Help me plan a solar installation" },
      { icon: "👷", text: "Find an installer in Lagos" },
      { icon: "📝", text: "What do I need to start going solar?" },
      { icon: "🔌", text: "Steps to set up EV charging at home" },
    ],
  },
  "Your Best Fit": {
    welcome: "I can help you find the best sustainable technology solutions based on your needs. Tell me what you're looking for.",
    prompts: [
      { icon: "☀️", text: "What solar system is best for my home?" },
      { icon: "💰", text: "How much does a solar setup cost in Nigeria?" },
      { icon: "🔋", text: "What battery storage fits my budget?" },
      { icon: "🚗", text: "Which EV suits my driving needs?" },
    ],
  },
  "Plan Ahead": {
    welcome: "I can help you forecast energy costs, ROI timelines, and plan your sustainable energy adoption. What would you like to plan?",
    prompts: [
      { icon: "📊", text: "What's the ROI for solar in 5 years?" },
      { icon: "💡", text: "How can I reduce my energy costs?" },
      { icon: "🏠", text: "Plan a complete home energy upgrade" },
      { icon: "📈", text: "Forecast my savings with solar" },
    ],
  },
  "Test & Try": {
    welcome: "I can help you model scenarios and compare technologies side by side before you commit. What would you like to test?",
    prompts: [
      { icon: "⚖️", text: "Compare solar vs generator costs" },
      { icon: "🔄", text: "Hybrid vs full solar system" },
      { icon: "🚗", text: "EV vs petrol car running costs" },
      { icon: "🔋", text: "Lithium vs lead-acid batteries" },
    ],
  },
  "Made for Your Area": {
    welcome: "I can provide solutions adapted to your local grid, climate, and regulations. Which country or city are you in?",
    prompts: [
      { icon: "🇳🇬", text: "Best solar options in Lagos, Nigeria" },
      { icon: "🌍", text: "What incentives are available in my area?" },
      { icon: "⚡", text: "How reliable is the grid where I live?" },
      { icon: "☀️", text: "Solar potential in my location" },
    ],
  },
  "What Others Need": {
    welcome: "I can share insights from collective trends and patterns across the Embraix community. What would you like to explore?",
    prompts: [
      { icon: "📊", text: "What are trending energy topics?" },
      { icon: "🏘️", text: "Popular solutions in my region" },
      { icon: "💬", text: "Common questions from homeowners" },
      { icon: "🔥", text: "Most recommended products" },
    ],
  },
  "General": {
    welcome: "Ask me anything about clean energy, solar, EVs, or smart technology. I'm here to help!",
    prompts: [
      { icon: "☀️", text: "Best solar setup for my home?" },
      { icon: "🚗", text: "Help me choose an EV" },
      { icon: "🔋", text: "Battery storage options" },
      { icon: "💰", text: "Solar installation costs" },
    ],
  },
};

const DEFAULT_PROMPTS = [
  { icon: "☀️", text: "Best solar setup for my home?" },
  { icon: "🚗", text: "Help me choose an EV" },
  { icon: "🔋", text: "Battery storage options" },
  { icon: "🏠", text: "Smart home energy tips" },
  { icon: "💰", text: "Solar installation costs" },
  { icon: "⚡", text: "How to cut my light bill?" },
];

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [hasTrackedFirstMessage, setHasTrackedFirstMessage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get mode from URL (for AI Hub sections)
  const [aiMode] = useState<string | null>(() => {
    const mode = searchParams.get("mode");
    return mode ? decodeURIComponent(mode) : null;
  });

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
  } = useChat();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Clean the mode from URL once captured
  useEffect(() => {
    if (aiMode) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Auto-focus input when chat opens
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
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
  };

  const lastMessage = messages[messages.length - 1];
  const showFollowUp = lastMessage?.role === "assistant" && lastMessage.content && !isStreaming;
  const currentConvData = conversations.find(c => c.id === currentConversation);

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
      onClose={() => setMobileSheetOpen(false)}
      isMobile
    />
  );

  return (
    <>
      <Helmet>
        <title>AI Consultant | Embraix</title>
        <meta name="description" content="Get expert AI-powered advice on clean energy, EVs, and sustainable technologies." />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-16 md:pt-18 flex bg-background">
        {/* Desktop Sidebar */}
        <div
          className={`hidden md:block transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          } overflow-hidden`}
        >
          <div className="w-72 h-[calc(100vh-4rem)]">
            <ConversationSidebar
              conversations={conversations}
              currentConversation={currentConversation}
              onSelect={setCurrentConversation}
              onCreate={handleNewConversation}
              onDelete={deleteConversation}
            />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <header className="flex items-center gap-4 p-4 border-b border-border/50">
            {/* Mobile Menu */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {SidebarContent}
              </SheetContent>
            </Sheet>

            {/* Desktop Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-semibold text-foreground">Embraix AI</h1>
                <p className="text-xs text-primary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            
            {/* Share + Preferences */}
            <div className="flex items-center gap-1">
              <ShareConversation 
                messages={messages} 
                title={currentConvData?.title} 
              />
              {user && <UserPreferencesDialog userId={user.id} />}
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {aiMode ? `Welcome to Embraix AI` : "How can I help you today?"}
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  {aiMode && AI_MODES[aiMode]
                    ? AI_MODES[aiMode].welcome
                    : "Ask about clean energy, EVs, solar, or smart tech. I'll keep it short and useful."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  {(aiMode && AI_MODES[aiMode] ? AI_MODES[aiMode].prompts : DEFAULT_PROMPTS).map((prompt, i) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="text-left p-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.02] transition-all duration-200 group"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="mr-2 text-base group-hover:scale-110 inline-block transition-transform">{prompt.icon}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""} animate-fade-in`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-primary-foreground" />
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
                        {message.content ? (
                          message.role === "assistant" ? (
                            <StreamingText 
                              content={message.content} 
                              isComplete={!isStreaming || index !== messages.length - 1} 
                            />
                          ) : (
                            <p>{message.content}</p>
                          )
                        ) : (
                          <TypingIndicator />
                        )}
                      </div>
                      
                      {/* Emoji Reactions + Feedback for assistant messages */}
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
                      
                      {/* Follow-up suggestions after last assistant message */}
                      {message.role === "assistant" && index === messages.length - 1 && showFollowUp && (
                        <FollowUpSuggestions 
                          onSelect={(suggestion) => handleSend(suggestion)} 
                          disabled={isStreaming}
                        />
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-medium text-foreground">
                          {user?.email?.[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            <div className="max-w-3xl mx-auto flex gap-2">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                disabled={isStreaming}
              />
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about clean energy, EVs, or smart tech..."
                className="flex-1 bg-secondary/50 border-border/50"
                disabled={isStreaming}
                autoFocus
              />
              <Button
                onClick={() => handleSend()}
                variant="hero"
                disabled={!input.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              Embraix AI may produce inaccurate information. Verify important details.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
