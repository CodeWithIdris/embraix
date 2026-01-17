import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  Rocket, 
  Star, 
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const contentTypes = [
  { icon: Newspaper, label: "News & Reports", href: "/news" },
  { icon: Rocket, label: "Projects & DIY", href: "/media/projects" },
  { icon: Star, label: "Reviews & Guides", href: "/media/reviews" },
  { icon: Megaphone, label: "Promotions", href: "/promotions" },
];

const BlogMedia = () => {
  const navigate = useNavigate();

  return (
    <section id="blog" className="py-16 relative overflow-hidden bg-card">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Media Hub
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
            Your Gateway to{" "}
            <span className="text-gradient">Sustainable Knowledge</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Comprehensive content on clean energy, electric vehicles, and smart technologies.
          </p>
        </div>

        {/* Content Types - Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          {contentTypes.map((type) => (
            <button
              key={type.label}
              onClick={() => navigate(type.href)}
              className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <type.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">{type.label}</span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/news")}
          >
            Browse All Content
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogMedia;
