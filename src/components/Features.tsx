import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileSearch, ShoppingBag, Wallet, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Centre",
    description: "Hiring hub & community for sustainable tech professionals.",
    status: "Coming Soon",
  },
  {
    icon: FileSearch,
    title: "Insight",
    description: "Research studies, publications, and industry analysis.",
    href: "/insight/reports",
  },
  {
    icon: ShoppingBag,
    title: "Store",
    description: "Curated marketplace for clean energy products.",
    href: "/store",
  },
  {
    icon: Wallet,
    title: "Wallet",
    description: "Digital payment platform for the ecosystem.",
    status: "Coming Soon",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-16 relative overflow-hidden bg-card">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
            Complete{" "}
            <span className="text-gradient">Sustainability Platform</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A suite of tools to accelerate sustainable development.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`group bg-background border-border/50 transition-all duration-300 overflow-hidden ${feature.href ? 'hover:border-primary/30 cursor-pointer' : ''}`}
              onClick={() => feature.href && navigate(feature.href)}
            >
              <CardContent className="p-5">
                {feature.status && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground mb-3">
                    {feature.status}
                  </span>
                )}
                {feature.href && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary mb-3">
                    Explore
                  </span>
                )}

                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>

                <h3 className="font-display text-base font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/newsletter")}
          >
            Stay Updated
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
