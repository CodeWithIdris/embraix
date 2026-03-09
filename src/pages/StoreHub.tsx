import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sun, Flame, Car, Cpu, Battery, Package, Wrench, Megaphone, ExternalLink, ShoppingBag,
} from "lucide-react";

const sections = [
  { id: "solar", icon: Sun, label: "Solar Solutions", description: "Solar panels, inverters, and complete solar kits", href: "/store/solar" },
  { id: "cooking", icon: Flame, label: "Clean Cooking", description: "LPG, biogas, electric cookers, and clean cooking solutions", href: "/store/clean-cooking" },
  { id: "ev", icon: Car, label: "Electric Vehicles", description: "EVs, e-bikes, charging stations, and accessories", href: "/store/electric-vehicles" },
  { id: "smart", icon: Cpu, label: "Smart Tech", description: "Smart home, energy monitors, IoT devices, and automation", href: "/store/smart-tech" },
  { id: "accessories", icon: Battery, label: "Energy Accessories", description: "Batteries, cables, connectors, and installation kits", href: "/store/accessories" },
  { id: "bundles", icon: Package, label: "Bundles & Packages", description: "Curated product bundles for homes and businesses", href: "/store/bundles" },
  { id: "services", icon: Wrench, label: "Product Services", description: "Installation, maintenance, and repair services", href: "/store/services" },
  { id: "deals", icon: Megaphone, label: "Promotions & Deals", description: "Limited-time offers, flash sales, and special deals", href: "/store/promotions" },
];

const StoreHub = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("solar");
  const active = sections.find((s) => s.id === activeId)!;

  return (
    <>
      <Helmet>
        <title>Store | Embraix</title>
        <meta name="description" content="Shop clean energy products — solar, EVs, smart tech, accessories, and bundles on Embraix." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Embraix <span className="text-gradient">Store</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Premium clean energy products, EV accessories, and smart technology — all in one place.
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
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4 border border-dashed border-border/50 rounded-xl mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <active.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{active.label}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{active.description}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Coming Soon
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate("/waitlist")} className="gap-1">
                    Get Notified
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(active.href)} className="gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit page
                  </Button>
                </div>
              </div>

              {/* Browse all products CTA */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <h3 className="font-display font-semibold mb-2">Browse All Products</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore our product catalog, compare solutions, and find the right energy system for you.
                </p>
                <Button onClick={() => navigate("/store/products")} className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  View Products & Compare
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

export default StoreHub;
