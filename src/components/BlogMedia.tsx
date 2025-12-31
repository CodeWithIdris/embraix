import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Mail, FileText, BarChart3, Star, Wrench, BookOpen, Rocket, Megaphone, ArrowRight } from "lucide-react";

const contentTypes = [
  { icon: Newspaper, label: "News", description: "Real-time industry updates" },
  { icon: Mail, label: "Newsletter", description: "Curated insights delivered" },
  { icon: FileText, label: "Reports", description: "In-depth market analysis" },
  { icon: BarChart3, label: "Analysis", description: "Expert evaluations" },
  { icon: Star, label: "Reviews", description: "Product assessments" },
  { icon: Wrench, label: "DIY Guides", description: "Step-by-step tutorials" },
  { icon: BookOpen, label: "Tutorials", description: "Educational resources" },
  { icon: Rocket, label: "Projects", description: "Case studies & showcases" },
  { icon: Megaphone, label: "Promotions", description: "Products & events" },
];

const BlogMedia = () => {
  return (
    <section id="blog" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-dark" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
            <Newspaper className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Blog & Media Hub</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Your Gateway to{" "}
            <span className="text-gradient">Sustainable Knowledge</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive, user-driven platform delivering vital content on clean energy, 
            electric vehicles, and smart technologies with focus on Africa and global audiences.
          </p>
        </div>

        {/* Content Types Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {contentTypes.map((type, index) => (
            <Card 
              key={type.label}
              className="group bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <type.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1 text-foreground">{type.label}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Articles Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              category: "Electric Vehicles",
              title: "The Rise of EV Infrastructure in East Africa",
              excerpt: "Exploring the rapid development of charging networks across Kenya, Uganda, and Tanzania.",
              readTime: "5 min read",
            },
            {
              category: "Solar Energy",
              title: "Off-Grid Solutions Transforming Rural Communities",
              excerpt: "How decentralized solar power is bringing electricity to millions across the continent.",
              readTime: "7 min read",
            },
            {
              category: "Smart Tech",
              title: "IoT Applications in Sustainable Agriculture",
              excerpt: "Smart sensors and data analytics revolutionizing farming practices in Africa.",
              readTime: "4 min read",
            },
          ].map((article, index) => (
            <Card 
              key={index}
              className="group gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-6">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-4">
                  {article.category}
                </span>
                <h3 className="font-display text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg">
            Explore All Content
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogMedia;
