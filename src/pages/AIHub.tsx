import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
  Sparkles, TrendingUp, FlaskConical, MapPin, Users, ArrowRight, Bot,
  Lightbulb, Calculator, Wrench, BarChart3, Zap, Send,
} from "lucide-react";

const categories = [
  {
    icon: Lightbulb,
    label: "Recommendations",
    description: "Product suggestions, system sizing, cost efficiency, and location-based advice.",
    systemPrompt: "User wants energy recommendations. Focus on: product suggestions, system sizing, cost efficiency, location-based advice. Ask clarifying questions about their needs before recommending.",
    welcome: "I'll help you find the best clean energy solutions for your situation. What are you looking for?",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    prompts: [
      "Best solar panel for a 3-bedroom house",
      "Recommend a battery for nighttime backup",
      "Which inverter fits a small business?",
    ],
  },
  {
    icon: Calculator,
    label: "Tools & Calculators",
    description: "Energy cost estimates, ROI calculations, savings projections, and system sizing.",
    systemPrompt: "User needs tools and calculators. Focus on: energy cost estimates, ROI calculations, savings projections, system sizing. Provide numbers and breakdowns when possible.",
    welcome: "I can help you calculate costs, ROI, and savings for clean energy systems. What would you like to estimate?",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    prompts: [
      "Calculate my solar ROI over 5 years",
      "How much can I save switching to solar?",
      "Size a solar system for my monthly usage",
    ],
  },
  {
    icon: Wrench,
    label: "Diagnostics & Support",
    description: "Troubleshooting help, identifying issues, step-by-step fixes, and safety guidance.",
    systemPrompt: "User needs troubleshooting help. Focus on: identifying issues, step-by-step fixes, safety guidance. Ask about symptoms before diagnosing.",
    welcome: "I can help you diagnose and fix issues with your energy system. What problem are you experiencing?",
    color: "text-red-500",
    bg: "bg-red-500/10",
    prompts: [
      "My inverter keeps beeping, what's wrong?",
      "Solar panels not producing enough power",
      "Battery not charging to full capacity",
    ],
  },
  {
    icon: BarChart3,
    label: "Intelligence & Trends",
    description: "Market insights, technology trends, policy updates, and industry analysis.",
    systemPrompt: "User wants intelligence and trend data. Focus on: market insights, technology trends, policy updates, industry analysis for Africa and globally. Provide data-backed insights.",
    welcome: "I can share the latest trends and intelligence in clean energy. What topic interests you?",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    prompts: [
      "What's trending in African solar market?",
      "Latest EV adoption trends in Nigeria",
      "New clean energy policies in 2026",
    ],
  },
  {
    icon: Zap,
    label: "Actions & Execution",
    description: "Installation planning, provider matching, project scoping, and next steps.",
    systemPrompt: "User wants to take action. Focus on: installation planning, provider matching, project scoping, concrete next steps. Guide them toward execution.",
    welcome: "Ready to take action! I can help you plan installations, find providers, and scope your project. What do you need?",
    color: "text-green-500",
    bg: "bg-green-500/10",
    prompts: [
      "Help me plan a solar installation",
      "Find an installer in Lagos",
      "What do I need to start going solar?",
    ],
  },
];

const quickPrompts = [
  { icon: "☀️", text: "Best solar setup for my home?" },
  { icon: "💰", text: "How much does solar cost in Nigeria?" },
  { icon: "🔋", text: "Battery storage options" },
  { icon: "🚗", text: "Help me choose an EV" },
];

const AIHub = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleCategoryClick = (category: typeof categories[0]) => {
    navigate(`/chat?mode=${encodeURIComponent(category.label)}`);
  };

  const handleDirectChat = (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;
    navigate(`/chat?mode=${encodeURIComponent("General")}&q=${encodeURIComponent(message.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleDirectChat();
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Solutions | Embraix</title>
        <meta name="description" content="Explore Embraix AI — personalised recommendations, diagnostics, calculators, intelligence, and actionable guidance." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Ask <span className="text-gradient">Embraix AI</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Your intelligent clean energy assistant — get recommendations, run calculations, diagnose issues, and more.
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about clean energy, solar, EVs..."
                className="flex-1 h-12 text-base bg-secondary/50 border-border/50"
              />
              <Button onClick={() => handleDirectChat()} variant="hero" className="h-12 px-5" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {quickPrompts.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleDirectChat(p.text)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <span className="mr-1">{p.icon}</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 text-center">
              Or choose a category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat)}
                  className="text-left p-5 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-glow transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.bg} group-hover:scale-105 transition-transform`}>
                      <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                          {cat.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                  {/* Inline prompts preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cat.prompts.slice(0, 2).map((prompt) => (
                      <span key={prompt} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                        {prompt}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Each category opens a focused AI chat session with context-aware guidance. Ask anything — switch topics anytime.
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
