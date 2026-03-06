import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Newspaper, FileText, Star, Wrench, BookOpen, Megaphone, PenTool 
} from "lucide-react";

const sections = [
  { icon: Newspaper, label: "News & Updates", description: "Community news, announcements, and platform updates", href: "/news" },
  { icon: FileText, label: "Reports & Analysis", description: "In-depth research, data analysis, and industry reports", href: "/media/reports" },
  { icon: Star, label: "Reviews", description: "Product reviews, comparisons, and expert ratings", href: "/media/reviews" },
  { icon: Wrench, label: "DIY Guides", description: "Tutorials, explainers, and hands-on how-to guides", href: "/media/diy-guides" },
  { icon: BookOpen, label: "Stories & Voices", description: "Case studies, success stories, and community voices", href: "/media/stories" },
  { icon: Megaphone, label: "Promotions & Opportunities", description: "Deals, partnerships, grants, and opportunities", href: "/promotions" },
  { icon: PenTool, label: "Articles", description: "Narrative pieces, thought leadership, and opinion", href: "/blog" },
];

const MediaHub = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Media | Embraix</title>
        <meta name="description" content="Explore Embraix media — news, reports, reviews, guides, stories, and articles on clean energy and sustainable technology." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Embraix <span className="text-gradient">Media</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your source for clean energy news, expert analysis, tutorials, and stories from across Africa and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                  <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default MediaHub;
