import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
  Bot, Lightbulb, Calculator, Wrench, BarChart3, Zap, Send,
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
      <div className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Embraix <span className="text-gradient">AI</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Ask anything about clean energy, solar, EVs, and smart technology.
            </p>
          </div>

          {/* Input */}
          <div className="mx-auto mb-14">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about clean energy..."
                className="flex-1 h-12 text-base bg-secondary/50 border-border/50 rounded-xl"
              />
              <Button onClick={() => handleChat()} variant="hero" className="h-12 px-5 rounded-xl" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {quickPrompts.slice(0, 4).map((p) => (
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
          {/* Feature Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((f) => (
              <button
                key={f.label}
                onClick={() => handleFeatureClick(f)}
                className="text-center p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-glow transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center mb-3 ${f.bg} group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <span className="font-display font-semibold text-xs text-foreground group-hover:text-primary transition-colors block">
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default AIHub;
