import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, TrendingUp, FlaskConical, MapPin, Users 
} from "lucide-react";

const sections = [
  { icon: Sparkles, label: "Your Best Fit", description: "Personalised energy and technology recommendations tailored to your needs", href: "/ai/best-fit" },
  { icon: TrendingUp, label: "Plan Ahead", description: "Predictive insights and forecasting tools for smarter energy decisions", href: "/ai/plan-ahead" },
  { icon: FlaskConical, label: "Test & Try", description: "Simulation tools to model scenarios before committing", href: "/ai/test-and-try" },
  { icon: MapPin, label: "Made for Your Area", description: "Location-aware solutions adapted to local conditions and regulations", href: "/ai/local-adaptation" },
  { icon: Users, label: "What Others Need", description: "Community intelligence — learn from trends and patterns across users", href: "/ai/community-intelligence" },
];

const AIHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Solutions | Embraix</title>
        <meta name="description" content="Explore Embraix AI — personalised recommendations, predictive insights, simulations, and community intelligence." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Intelligent tools powered by AI to help you make better energy and technology decisions — personalised, predictive, and community-driven.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sections.map((s) => (
              <Card
                key={s.label}
                className="gradient-card border-border/50 hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => navigate(s.href)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
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
