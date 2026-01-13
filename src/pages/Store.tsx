import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Zap, Sun, Battery, Truck } from "lucide-react";

const categories = [
  { icon: Sun, label: "Solar Panels", description: "High-efficiency solar panels for homes and businesses" },
  { icon: Battery, label: "Batteries", description: "Energy storage solutions and power banks" },
  { icon: Zap, label: "EV Chargers", description: "Home and commercial EV charging stations" },
  { icon: Package, label: "Accessories", description: "Cables, connectors, and installation kits" },
];

const Store = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Store | Embraix</title>
        <meta name="description" content="Shop clean energy products, EV chargers, solar panels and more" />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">Store</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Shop premium clean energy products, EV accessories, and smart technology equipment.
            </p>
          </div>

          {/* Coming Soon */}
          <Card className="max-w-4xl mx-auto gradient-card border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-8">
                We're building a marketplace for quality clean energy products. 
                Browse our planned categories below:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {categories.map((cat) => (
                  <div 
                    key={cat.label}
                    className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <cat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-primary/10">
                <Truck className="w-6 h-6 text-primary" />
                <p className="text-sm">
                  <span className="font-medium">Delivery across Africa</span>
                  <span className="text-muted-foreground"> — Subscribe to our newsletter for launch updates</span>
                </p>
              </div>

              <div className="text-center mt-8">
                <Button variant="hero" onClick={() => navigate("/newsletter")}>
                  Get Notified at Launch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default Store;
