import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GraduationCap, Users, ShoppingBag, HelpCircle, MessageSquare, Lightbulb 
} from "lucide-react";

const sections = [
  { icon: GraduationCap, label: "Learning Hub", description: "Tutorials, courses, and educational resources on clean energy", href: "/centre/learning" },
  { icon: Users, label: "Collaboration Space", description: "Connect, share ideas, and collaborate with the community", href: "/centre/collaboration" },
  { icon: ShoppingBag, label: "Product Access", description: "Showroom and marketplace for clean energy products", href: "/centre/products" },
  { icon: HelpCircle, label: "Support Services", description: "FAQs, help desk, and technical support", href: "/centre/support" },
  { icon: MessageSquare, label: "Expert Consultation", description: "Live chat with certified specialists and industry experts", href: "/consult-expert" },
  { icon: Lightbulb, label: "Innovation Lab", description: "Experimental tools, prototypes, and innovation projects", href: "/centre/innovation" },
];

const CentreHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Centre | Embraix</title>
        <meta name="description" content="Embraix Centre — learning, collaboration, product access, support, consultation, and innovation." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">Centre</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your hub for learning, collaboration, expert support, and innovation in sustainable technology.
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

export default CentreHub;
