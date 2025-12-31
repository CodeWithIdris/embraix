import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lightbulb, ShoppingBag, Wallet, ArrowRight, Building2, FileSearch } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Embraix Centre",
    description: "A hiring and collaboration hub connecting skilled service professionals with sustainable technology projects across Africa.",
    color: "from-blue-500 to-cyan-500",
    highlights: ["Professional Directory", "Hiring Platform", "Community Hub"],
    status: "Coming Soon",
  },
  {
    icon: FileSearch,
    title: "Embraix Insight",
    description: "Research and publication platform delivering high-quality studies, publications, and articles on sustainable technologies.",
    color: "from-purple-500 to-pink-500",
    highlights: ["Research Studies", "Publications", "Knowledge Base"],
    status: "Coming Soon",
  },
  {
    icon: ShoppingBag,
    title: "Embraix Store",
    description: "Curated online marketplace for clean energy products, EV components, and smart technology solutions.",
    color: "from-orange-500 to-red-500",
    highlights: ["Product Catalog", "Quality Assured", "Africa-Focused"],
    status: "Coming Soon",
  },
  {
    icon: Wallet,
    title: "Embraix Wallet",
    description: "Digital payment platform with dedicated coin system for seamless transactions within the Embraix ecosystem.",
    color: "from-green-500 to-emerald-500",
    highlights: ["Digital Coins", "Low-Cost Transfers", "Secure Payments"],
    status: "Coming Soon",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-dark" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Ecosystem Features</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Building the Complete{" "}
            <span className="text-gradient">Sustainability Platform</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our roadmap includes a comprehensive suite of tools designed to accelerate 
            sustainable development across Africa and beyond.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group gradient-card border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden relative"
            >
              <CardContent className="p-8">
                {/* Status Badge */}
                <span className="absolute top-6 right-6 px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {feature.status}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground mb-6">{feature.description}</p>

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

              {/* Hover Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-[0.03]`} />
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to stay updated on new feature releases?
          </p>
          <Button variant="outline" size="lg">
            Join the Waitlist
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;
