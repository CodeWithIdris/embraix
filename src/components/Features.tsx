import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileSearch, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Centre",
    description: "Find trusted professionals for clean energy services.",
    href: "/centre",
  },
  {
    icon: FileSearch,
    title: "Insight",
    description: "Research, publications, and industry analysis.",
    href: "/insight/reports",
  },
  {
    icon: ShoppingBag,
    title: "Store",
    description: "Curated marketplace for clean energy products.",
    href: "/store",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-12 relative overflow-hidden bg-card">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group bg-background border-border/50 hover:border-primary/30 cursor-pointer transition-all duration-300"
              onClick={() => navigate(feature.href)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold mb-1 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/newsletter")}
            className="text-muted-foreground hover:text-primary"
          >
            Stay Updated
            <ArrowRight className="ml-2 w-3 h-3" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
