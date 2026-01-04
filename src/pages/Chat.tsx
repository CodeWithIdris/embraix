import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import TypingIndicator from "@/components/chat/TypingIndicator";
import FollowUpSuggestions from "@/components/chat/FollowUpSuggestions";
import Header from "@/components/Header";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
  } = useChat();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim() || isStreaming) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showFollowUp = lastMessage?.role === "assistant" && lastMessage.content && !isStreaming;

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
        <title>AI Consultant | Embraix</title>
        <meta name="description" content="Get expert AI-powered advice on clean energy, EVs, and sustainable technologies." />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-16 md:pt-18 flex flex-col bg-background">
        {/* Chat Header */}
        <header className="flex items-center gap-4 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-foreground">Embraix AI Consultant</h1>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Online
              </p>
            </div>
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
                How can I help you today?
              </h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Ask me anything about clean energy, electric vehicles, solar installations, 
                or smart technologies. I'm here to provide expert guidance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  "What's the best solar setup for my home?",
                  "How do I choose an electric vehicle?",
                  "Explain battery storage options",
                  "Smart home energy tips"
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="text-left p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""} animate-fade-in`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
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
                    <div className="text-sm text-foreground">
                      {message.content ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <span className="font-semibold">{children}</span>,
                            em: ({ children }) => <span className="italic">{children}</span>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <TypingIndicator />
                      )}
                    </div>
                    {/* Show follow-up suggestions after last assistant message */}
                    {message.role === "assistant" && index === messages.length - 1 && showFollowUp && (
                      <FollowUpSuggestions 
                        onSelect={(suggestion) => handleSend(suggestion)} 
                        disabled={isStreaming}
                      />
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
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
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about clean energy, EVs, or smart tech..."
              className="flex-1 bg-secondary/50 border-border/50"
              disabled={isStreaming}
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
        </div>
      </div>
    </>
  );
};

export default Chat;