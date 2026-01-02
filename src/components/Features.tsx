import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, FileSearch, ShoppingBag, Wallet, ArrowRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Building2,
    title: "Embraix Centre",
    description: "A hiring and collaboration hub connecting skilled professionals with sustainable technology projects across Africa.",
    highlights: ["Professional Directory", "Hiring Platform", "Community Hub"],
    status: "Coming Soon",
  },
  {
    icon: FileSearch,
    title: "Embraix Insight",
    description: "Research platform delivering high-quality studies, publications, and articles on sustainable technologies.",
    highlights: ["Research Studies", "Publications", "Knowledge Base"],
    status: "Coming Soon",
  },
  {
    icon: ShoppingBag,
    title: "Embraix Store",
    description: "Curated marketplace for clean energy products, EV components, and smart technology solutions.",
    highlights: ["Product Catalog", "Quality Assured", "Africa-Focused"],
    status: "Coming Soon",
  },
  {
    icon: Wallet,
    title: "Embraix Wallet",
    description: "Digital payment platform with dedicated coin system for seamless transactions within the Embraix ecosystem.",
    highlights: ["Digital Coins", "Low-Cost Transfers", "Secure Payments"],
    status: "Coming Soon",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-card">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Coming Soon</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Building the Complete{" "}
            <span className="text-gradient">Sustainability Platform</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our roadmap includes a comprehensive suite of tools designed to accelerate 
            sustainable development across Africa and beyond.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group bg-background border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-8">
                {/* Status Badge */}
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground mb-6">
                  {feature.status}
                </span>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-secondary/50 text-foreground border border-border/50"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to stay updated on new feature releases?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/newsletter")}
          >
            Join the Waitlist
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
