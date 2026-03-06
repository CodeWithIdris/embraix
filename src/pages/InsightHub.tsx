import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, BarChart3, Globe, Users, Landmark, FileText 
} from "lucide-react";

const sections = [
  { icon: TrendingUp, label: "Trends & Forecasts", description: "Emerging trends and forward-looking analysis in clean energy", href: "/insight/trends" },
  { icon: BarChart3, label: "Impact Reports", description: "Measurable outcomes and impact assessments across projects", href: "/insight/impact-reports" },
  { icon: Globe, label: "Market Intelligence", description: "Data-driven market insights and competitive landscape analysis", href: "/insight/market-intelligence" },
  { icon: Users, label: "Community Insights", description: "Patterns and feedback from the Embraix community", href: "/insight/community-insights" },
  { icon: Landmark, label: "Policy & Strategy Guidance", description: "Regulatory updates, policy frameworks, and strategic guidance", href: "/insight/policy" },
  { icon: FileText, label: "Research Publications", description: "Whitepapers, academic papers, and technical research", href: "/insight/whitepapers" },
];

const InsightHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Insight | Embraix</title>
        <meta name="description" content="Embraix Insight — trends, impact reports, market intelligence, policy guidance, and research publications." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">Insight</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Deep analysis, research, and intelligence to guide decisions in sustainable energy and technology.
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

export default InsightHub;
