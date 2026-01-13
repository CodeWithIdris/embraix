import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, GraduationCap, Users, ArrowLeft, MessageSquare, BookOpen, Calendar } from "lucide-react";

const sections = {
  support: {
    title: "Help & Support",
    icon: HelpCircle,
    description: "Get help with your questions and issues",
    content: [
      { title: "FAQ", description: "Frequently asked questions about clean energy and EVs" },
      { title: "Contact Us", description: "Reach out to our support team" },
      { title: "Documentation", description: "Technical guides and resources" },
    ]
  },
  learning: {
    title: "Learning Centre",
    icon: GraduationCap,
    description: "Educational resources and tutorials",
    content: [
      { title: "Tutorials", description: "Step-by-step guides for clean energy solutions" },
      { title: "Courses", description: "In-depth learning modules" },
      { title: "Webinars", description: "Live and recorded sessions with experts" },
    ]
  },
  community: {
    title: "Community",
    icon: Users,
    description: "Connect with fellow enthusiasts",
    content: [
      { title: "Forums", description: "Discuss topics with the community" },
      { title: "Events", description: "Meetups, conferences, and workshops" },
      { title: "Groups", description: "Join specialized interest groups" },
    ]
  }
};

const Centre = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  
  const currentSection = section && sections[section as keyof typeof sections];

  if (!currentSection) {
    return (
      <>
        <Helmet>
          <title>Centre | Embraix</title>
        </Helmet>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Section not found</p>
              <Button variant="hero" onClick={() => navigate("/")}>
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const IconComponent = currentSection.icon;

  return (
    <>
      <Helmet>
        <title>{currentSection.title} | Embraix</title>
        <meta name="description" content={currentSection.description} />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Hero */}
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {currentSection.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentSection.description}
            </p>
          </div>

          {/* Content Cards */}
          <div className="max-w-4xl mx-auto">
            <Card className="gradient-card border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">Coming Soon!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-8">
                  We're building out this section. Here's what to expect:
                </p>

                <div className="space-y-4">
                  {currentSection.content.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {index === 0 && <MessageSquare className="w-5 h-5 text-primary" />}
                        {index === 1 && <BookOpen className="w-5 h-5 text-primary" />}
                        {index === 2 && <Calendar className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button variant="hero" onClick={() => navigate("/newsletter")}>
                    Get Notified When Available
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default Centre;
