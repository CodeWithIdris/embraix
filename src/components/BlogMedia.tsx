import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Newspaper, 
  FileText, 
  BarChart3, 
  Star, 
  Wrench, 
  BookOpen, 
  Rocket, 
  ArrowRight,
  Clock,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const contentTypes = [
  { icon: Newspaper, label: "News", description: "Industry updates", href: "/media/news" },
  { icon: FileText, label: "Reports", description: "Market analysis", href: "/media/reports" },
  { icon: BarChart3, label: "Analysis", description: "Expert insights", href: "/media/analysis" },
  { icon: Star, label: "Reviews", description: "Product assessments", href: "/media/reviews" },
  { icon: Wrench, label: "DIY Guides", description: "Hands-on tutorials", href: "/media/diy-guides" },
  { icon: BookOpen, label: "Tutorials", description: "Learning resources", href: "/media/tutorials" },
  { icon: Rocket, label: "Projects", description: "Case studies", href: "/media/projects" },
];

const featuredArticles = [
  {
    category: "Electric Vehicles",
    title: "The Rise of EV Infrastructure in East Africa",
    excerpt: "Exploring the rapid development of charging networks across Kenya, Uganda, and Tanzania.",
    readTime: "5 min",
    trending: true,
  },
  {
    category: "Solar Energy",
    title: "Off-Grid Solutions Transforming Rural Communities",
    excerpt: "How decentralized solar power is bringing electricity to millions across the continent.",
    readTime: "7 min",
    trending: false,
  },
  {
    category: "Smart Tech",
    title: "IoT Applications in Sustainable Agriculture",
    excerpt: "Smart sensors and data analytics revolutionizing farming practices in Africa.",
    readTime: "4 min",
    trending: true,
  },
];

const BlogMedia = () => {
  const navigate = useNavigate();

  return (
    <section id="blog" className="py-24 relative overflow-hidden bg-card">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Media Hub
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Your Gateway to{" "}
            <span className="text-gradient">Sustainable Knowledge</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Comprehensive content on clean energy, electric vehicles, and smart technologies 
            tailored for Africa and global audiences.
          </p>
        </div>

        {/* Content Types */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {contentTypes.map((type) => (
            <button
              key={type.label}
              onClick={() => navigate(type.href)}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-secondary/50 border border-border/50 hover:border-primary/30 hover:bg-secondary transition-all duration-300"
            >
              <type.icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {featuredArticles.map((article, index) => (
            <Card 
              key={index}
              className="group bg-background border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {article.category}
                  </span>
                  {article.trending && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/media/news")}
          >
            Explore All Content
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogMedia;
