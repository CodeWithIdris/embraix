import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, TrendingUp, FlaskConical, MapPin, Users, ArrowRight, Bot,
} from "lucide-react";

const sections = [
  {
    icon: Sparkles,
    label: "Your Best Fit",
    badge: "Personalised",
    description: "Get recommendations tailored to your energy needs, budget, and lifestyle.",
    prompt: "Help the user find the best sustainable technology solutions based on their needs. Start by asking a few targeted questions about their energy situation, budget, and goals.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: TrendingUp,
    label: "Plan Ahead",
    badge: "Predictive",
    description: "Forecast energy costs, ROI timelines, and adoption strategies.",
    prompt: "Provide predictive insights and planning recommendations for sustainable energy adoption. Ask about their current energy use, goals, and timeline to generate a personalised plan.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: FlaskConical,
    label: "Test & Try",
    badge: "Simulation",
    description: "Model scenarios before committing — compare technologies side by side.",
    prompt: "Simulate different sustainable technology scenarios and help the user compare outcomes. Ask what they want to test and walk them through a step-by-step scenario comparison.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: MapPin,
    label: "Made for Your Area",
    badge: "Location-Aware",
    description: "Solutions adapted to your local grid, climate, and regulations.",
    prompt: "Provide sustainable energy recommendations tailored to the user's location. Start by asking for their country or city, then provide location-specific insights on solar potential, grid reliability, and available incentives.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Users,
    label: "What Others Need",
    badge: "Community",
    description: "Learn from collective trends and patterns across the Embraix community.",
    prompt: "Analyze community needs and suggest solutions based on collective insights. Share trending clean energy topics and ask what specific area of community intelligence the user wants to explore.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const AIHub = () => {
  const navigate = useNavigate();

  const handleSectionClick = (section: typeof sections[0]) => {
    // Pass mode instead of auto-sending prompt
    navigate(`/chat?mode=${encodeURIComponent(section.label)}`);
  };

  return (
    <>
      <Helmet>
        <title>AI Solutions | Embraix</title>
        <meta name="description" content="Explore Embraix AI — personalised recommendations, predictive insights, simulations, and community intelligence." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Embraix AI</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              What do you want to <span className="text-gradient">explore?</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Choose a mode to start a focused AI conversation — each opens a tailored chat session instantly.
            </p>
          </div>

          {/* Section List */}
          <div className="space-y-3">
            {sections.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSectionClick(s.prompt)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-glow transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg} group-hover:scale-105 transition-transform`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-sm md:text-base">
                      {s.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 hidden sm:flex">
                      {s.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Each mode starts a new contextual chat. You can switch topics at any time within the conversation.
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
