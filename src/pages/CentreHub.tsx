import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Users, ShoppingBag, HelpCircle, MessageSquare, Lightbulb, ExternalLink,
} from "lucide-react";

const sections = [
  { id: "learning", icon: GraduationCap, label: "Learning Hub", description: "Tutorials, courses, and educational resources on clean energy", href: "/centre/learning" },
  { id: "collaboration", icon: Users, label: "Collaboration Space", description: "Connect, share ideas, and collaborate with the community", href: "/centre/collaboration" },
  { id: "products", icon: ShoppingBag, label: "Product Access", description: "Showroom and marketplace for clean energy products", href: "/centre/products" },
  { id: "support", icon: HelpCircle, label: "Support Services", description: "Request clean energy services — installation, audits, and more", href: "/centre/support-services" },
  { id: "consultation", icon: MessageSquare, label: "Expert Consultation", description: "Live chat with certified specialists and industry experts", href: "/consult-expert" },
  { id: "innovation", icon: Lightbulb, label: "Innovation Lab", description: "Experimental tools, prototypes, and innovation projects", href: "/centre/innovation" },
];

const CentreHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("learning");
  const active = sections.find((s) => s.id === activeId)!;

  return (
    <>
      <Helmet>
        <title>Centre | Embraix</title>
        <meta name="description" content="Embraix Centre — learning, collaboration, product access, support, consultation, and innovation." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Centre</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Your hub for learning, collaboration, expert support, and innovation.
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

              {/* Expert Consultation has live page */}
              {activeId === "consultation" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-primary/20 bg-primary/5 rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">Expert Consultation</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Connect directly with certified clean energy specialists for personalised guidance.
                    </p>
                  </div>
                  <Button variant="hero" size="sm" onClick={() => navigate("/consult-expert")}>
                    Start Consultation
                  </Button>
                </div>
              ) : (
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
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default CentreHub;
