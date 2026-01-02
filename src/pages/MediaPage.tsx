import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Newspaper, 
  FileText, 
  BarChart3, 
  Star, 
  Wrench, 
  BookOpen, 
  Rocket,
  Clock,
  TrendingUp
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categoryConfig: Record<string, { title: string; description: string; icon: React.ComponentType<any> }> = {
  news: {
    title: "News",
    description: "Stay updated with the latest developments in clean energy, electric vehicles, and smart technologies.",
    icon: Newspaper,
  },
  reports: {
    title: "Reports",
    description: "In-depth market analysis and research reports on sustainable technology trends.",
    icon: FileText,
  },
  analysis: {
    title: "Analysis",
    description: "Expert evaluations and insights on industry developments and opportunities.",
    icon: BarChart3,
  },
  reviews: {
    title: "Reviews",
    description: "Comprehensive product assessments and comparisons for informed decisions.",
    icon: Star,
  },
  "diy-guides": {
    title: "DIY Guides",
    description: "Hands-on tutorials and step-by-step guides for sustainable technology projects.",
    icon: Wrench,
  },
  tutorials: {
    title: "Tutorials",
    description: "Educational resources and learning materials for all skill levels.",
    icon: BookOpen,
  },
  projects: {
    title: "Projects",
    description: "Case studies and showcases of successful sustainable technology implementations.",
    icon: Rocket,
  },
};

const sampleArticles = [
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
  {
    category: "Battery Storage",
    title: "Advances in Home Battery Systems",
    excerpt: "New developments in residential energy storage making solar more practical.",
    readTime: "6 min",
    trending: false,
  },
];

const MediaPage = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  
  const config = category && categoryConfig[category] 
    ? categoryConfig[category] 
    : { title: "Media", description: "Explore our content library", icon: Newspaper };

  const IconComponent = config.icon;

  return (
    <>
      <Helmet>
        <title>{config.title} - Embraix Media</title>
        <meta name="description" content={config.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
              <Button
                variant="ghost"
                size="sm"
                className="mb-8"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              {/* Header */}
              <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <IconComponent className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Media Hub</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  <span className="text-gradient">{config.title}</span>
                </h1>

                <p className="text-lg text-muted-foreground">
                  {config.description}
                </p>
              </div>

              {/* Category Navigation */}
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {Object.entries(categoryConfig).map(([key, value]) => {
                  const Icon = value.icon;
                  const isActive = category === key;
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "hero" : "outline"}
                      size="sm"
                      onClick={() => navigate(`/media/${key}`)}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {value.title}
                    </Button>
                  );
                })}
              </div>

              {/* Articles Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {sampleArticles.map((article, index) => (
                  <Card 
                    key={index}
                    className="group bg-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readTime} read
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Coming Soon Notice */}
              <div className="mt-16 text-center">
                <Card className="bg-secondary/30 border-border/50 max-w-2xl mx-auto">
                  <CardContent className="p-8">
                    <IconComponent className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      More Content Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      We're actively building our content library. Subscribe to our newsletter 
                      to get notified when new articles are published.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MediaPage;
