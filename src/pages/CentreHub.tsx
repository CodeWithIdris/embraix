import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wrench, HelpCircle, MessageSquare, GraduationCap, Users, ExternalLink,
} from "lucide-react";

const sections = [
  { id: "installation", icon: Wrench, label: "Installation & Setup", description: "Professional solar installation, EV charger setup, and system configuration", href: "/centre/support-services" },
  { id: "maintenance", icon: Wrench, label: "Maintenance & Repairs", description: "Routine maintenance, troubleshooting, and repair services for clean energy systems", href: "/centre/support-services" },
  { id: "support", icon: HelpCircle, label: "Customer Support", description: "Request assistance, track service requests, and get expert help", href: "/centre/support-services" },
  { id: "training", icon: GraduationCap, label: "Training & Certification", description: "Courses, certifications, and professional development for installers and technicians", href: "/centre/installer-register" },
  { id: "community", icon: Users, label: "Community Services", description: "Connect with the community, expert consultations, and collaborative projects", href: "/consult-expert" },
];

const CentreHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("installation");
  const active = sections.find((s) => s.id === activeId)!;

  const renderContent = () => {
    if (activeId === "installation" || activeId === "maintenance" || activeId === "support") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-primary/20 bg-primary/5 rounded-xl">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
            <active.icon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-1">{active.label}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">{active.description}</p>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/centre/support-services")}>
            Request a Service
          </Button>
        </div>
      );
    }

    if (activeId === "training") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-primary/20 bg-primary/5 rounded-xl">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-1">Training & Certification</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Build your skills, earn certifications, or apply to join the Embraix installer network.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={() => navigate("/centre/installer-register")}>
              Apply as Installer
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/centre/installer-dashboard")}>
              Installer Dashboard
            </Button>
          </div>
        </div>
      );
    }

    if (activeId === "community") {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-primary/20 bg-primary/5 rounded-xl">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-1">Community & Expert Support</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect with certified clean energy specialists for personalised guidance.
            </p>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/consult-expert")}>
            Start Consultation
          </Button>
        </div>
      );
    }

    return (
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
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Centre | Embraix</title>
        <meta name="description" content="Embraix Centre — installation, maintenance, support, training, and community services." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Centre</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Installation, maintenance, support, training, and community services.
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

            <main className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-foreground">{active.label}</h2>
                  <p className="text-xs text-muted-foreground">{active.description}</p>
                </div>
              </div>
              {renderContent()}
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
