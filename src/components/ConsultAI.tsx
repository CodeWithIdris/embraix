import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, Users, Globe, MessageSquare, ArrowRight, CheckCircle, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const features = [
  { icon: CheckCircle, text: "Free rapid consultations" },
  { icon: CheckCircle, text: "AI-powered recommendations" },
  { icon: CheckCircle, text: "Expert industry insights" },
  { icon: CheckCircle, text: "Africa-focused solutions" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ConsultAI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("ai-chat", {
        body: { messages: [...messages, { role: "user", content: userMessage }] },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Handle streaming response
      const reader = response.data?.body?.getReader();
      if (reader) {
        let assistantMessage = "";
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                assistantMessage += content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                  return updated;
                });
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="consult" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/2 left-0 w-1/2 h-[500px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Embraix AI
            </span>

            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Free Expert Guidance{" "}
              <span className="text-gradient">Powered by AI</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Get rapid, personalized consultation on clean energy, electric vehicles, 
              and smart technologies. Our AI delivers tailored guidance to help you 
              navigate challenges and seize opportunities.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate(user ? "/chat" : "/auth")}
            >
              {user ? "Open Full Chat" : "Start Free Consultation"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Right - Live AI Chat */}
          <div className="relative">
            <Card className="bg-card border-border/50 shadow-elevated overflow-hidden">
              <CardContent className="p-0">
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-secondary/30">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">Embraix AI</h4>
                    <span className="text-xs text-primary flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      Online & Ready
                    </span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[280px] max-h-[320px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <>
                      {/* Welcome Message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                          <p className="text-sm text-foreground">
                            Hi! I'm Embraix AI, your expert consultant for clean energy, EVs, and smart technologies. 
                            How can I help you today?
                          </p>
                        </div>
                      </div>

                      {/* Suggestion Chips */}
                      <div className="flex flex-wrap gap-2 pl-11">
                        {["Solar installation tips", "EV charging options", "Smart home setup"].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              if (user) {
                                setInput(suggestion);
                              } else {
                                navigate("/auth");
                              }
                            }}
                            className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "gap-3"}`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-secondary/50 text-foreground rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border/50 bg-secondary/20">
                  <div className="flex items-center gap-3 bg-background rounded-xl px-4 py-2.5 border border-border/50">
                    <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={user ? "Ask about clean energy, EVs, or smart tech..." : "Sign in to start chatting..."}
                      disabled={!user}
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
                    />
                    <Button
                      size="sm"
                      variant="hero"
                      className="h-8 w-8 p-0"
                      onClick={user ? handleSend : () => navigate("/auth")}
                      disabled={isLoading || (!user && false)}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {!user && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      <button 
                        onClick={() => navigate("/auth")} 
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </button>
                      {" "}to start chatting with Embraix AI
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-card border border-border/50 rounded-xl p-4 shadow-elevated animate-float hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">2,500+</div>
                  <div className="text-xs text-muted-foreground">Consultations</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card border border-border/50 rounded-xl p-4 shadow-elevated animate-float hidden md:block" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">15+</div>
                  <div className="text-xs text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultAI;
