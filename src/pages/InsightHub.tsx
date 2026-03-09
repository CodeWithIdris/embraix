import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, BarChart3, Globe, Users, Landmark, FileText, ExternalLink,
} from "lucide-react";

const sections = [
  { id: "trends", icon: TrendingUp, label: "Trends & Forecasts", description: "Emerging trends and forward-looking analysis in clean energy", href: "/insight/trends" },
  { id: "impact", icon: BarChart3, label: "Impact Reports", description: "Measurable outcomes and impact assessments across projects", href: "/insight/impact-reports" },
  { id: "market", icon: Globe, label: "Market Intelligence", description: "Data-driven market insights and competitive landscape analysis", href: "/insight/market-intelligence" },
  { id: "community", icon: Users, label: "Community Insights", description: "Patterns and feedback from the Embraix community", href: "/insight/community-insights" },
  { id: "policy", icon: Landmark, label: "Policy & Strategy", description: "Regulatory updates, policy frameworks, and strategic guidance", href: "/insight/policy" },
  { id: "research", icon: FileText, label: "Research Publications", description: "Community-contributed research, whitepapers, and technical analysis", href: "/insight/research" },
];

const InsightHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("trends");
  const active = sections.find((s) => s.id === activeId)!;

  return (
    <>
      <Helmet>
        <title>Insight | Embraix</title>
        <meta name="description" content="Embraix Insight — trends, impact reports, market intelligence, policy guidance, and research publications." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Insight</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Deep analysis, research, and intelligence to guide decisions in sustainable energy.
            </p>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:hidden scrollbar-none">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeId === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
                }`}
              >
                <s.icon className="w-3 h-3" />
                {s.label.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden md:block w-52 flex-shrink-0">
              <nav className="sticky top-24 space-y-0.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeId === s.id
                        ? "bg-primary/10 text-primary font-medium border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <s.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-foreground">{active.label}</h2>
                  <p className="text-xs text-muted-foreground">{active.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-dashed border-border/50 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <active.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{active.label}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{active.description}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  Coming Soon
                </Badge>
                <Button variant="outline" size="sm" onClick={() => navigate(active.href)} className="gap-1">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Visit page
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default InsightHub;
