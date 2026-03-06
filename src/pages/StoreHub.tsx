import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sun, Flame, Car, Cpu, Battery, Package, Wrench, Megaphone 
} from "lucide-react";

const sections = [
  { icon: Sun, label: "Solar Solutions", description: "Solar panels, inverters, and complete solar kits", href: "/store/solar" },
  { icon: Flame, label: "Clean Cooking", description: "LPG, biogas, electric cookers, and clean cooking solutions", href: "/store/clean-cooking" },
  { icon: Car, label: "Electric Vehicles", description: "EVs, e-bikes, charging stations, and accessories", href: "/store/electric-vehicles" },
  { icon: Cpu, label: "Smart Tech", description: "Smart home, energy monitors, IoT devices, and automation", href: "/store/smart-tech" },
  { icon: Battery, label: "Energy Accessories", description: "Batteries, cables, connectors, and installation kits", href: "/store/accessories" },
  { icon: Package, label: "Bundles & Packages", description: "Curated product bundles for homes and businesses", href: "/store/bundles" },
  { icon: Wrench, label: "Product Services", description: "Installation, maintenance, and repair services", href: "/store/services" },
  { icon: Megaphone, label: "Promotions & Deals", description: "Limited-time offers, flash sales, and special deals", href: "/store/promotions" },
];

const StoreHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Store | Embraix</title>
        <meta name="description" content="Shop clean energy products — solar, EVs, smart tech, accessories, and bundles on Embraix." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">Store</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium clean energy products, EV accessories, and smart technology — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                  <h3 className="font-display text-base font-semibold group-hover:text-primary transition-colors">{s.label}</h3>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="lg" onClick={() => navigate("/waitlist")}>
              Get Notified at Launch
            </Button>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default StoreHub;
