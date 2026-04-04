import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
  Bot, Lightbulb, Calculator, Wrench, BarChart3, Zap, Send, Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    label: "Recommendations",
    description: "Product suggestions, system sizing, and cost-efficient solutions.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Calculator,
    label: "Calculators",
    description: "Energy costs, ROI estimates, savings projections.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Wrench,
    label: "Diagnostics",
    description: "Troubleshoot issues, step-by-step fixes, safety guidance.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: BarChart3,
    label: "Insights",
    description: "Market trends, policy updates, industry intelligence.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    label: "Assistance",
    description: "Installation planning, provider matching, project scoping.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

const quickPrompts = [
  { icon: "☀️", text: "Best solar setup for my home?" },
  { icon: "💰", text: "How much does solar cost in Nigeria?" },
  { icon: "🔋", text: "Battery storage options" },
  { icon: "🚗", text: "Help me choose an EV" },
  { icon: "🔧", text: "My inverter keeps tripping" },
  { icon: "📊", text: "Solar market trends in Africa" },
];

const AIHub = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleFeatureClick = (feature: typeof features[0]) => {
    navigate(`/chat?mode=${encodeURIComponent(feature.label)}`);
  };

  const handleChat = (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(message.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <>
      <Helmet>
        <title>Embraix AI — Your Smart Energy Companion</title>
        <meta name="description" content="Get personalised clean energy recommendations, run calculations, diagnose issues, and get actionable guidance with Embraix AI." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Embraix <span className="text-gradient">AI</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Your smart energy companion — ask anything about clean energy, solar, EVs, and more.
            </p>
          </div>

          {/* Input */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about clean energy..."
                className="flex-1 h-12 text-base bg-secondary/50 border-border/50"
              />
              <Button onClick={() => handleChat()} variant="hero" className="h-12 px-5" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {quickPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleChat(p.text)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <span className="mr-1">{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {features.map((f) => (
              <button
                key={f.label}
                onClick={() => handleFeatureClick(f)}
                className="text-center p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-glow transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${f.bg} group-hover:scale-105 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <span className="font-display font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {f.label}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{f.description}</p>
              </button>
            ))}
          </div>

          {/* Bottom hint */}
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Click a feature to start a focused AI session, or type your question directly. Switch topics anytime.
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default AIHub;
