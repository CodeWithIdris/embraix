import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  BookOpen,
  Lock,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const benefits = [
  { icon: Zap, title: "Weekly Insights", description: "Curated updates on clean energy and EV trends" },
  { icon: TrendingUp, title: "Market Analysis", description: "Exclusive reports and industry forecasts" },
  { icon: BookOpen, title: "Early Access", description: "First look at new guides and tutorials" },
];

const Newsletter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please sign in to subscribe to the newsletter");
      navigate("/auth");
      return;
    }
    // TODO: Implement actual subscription logic
    setIsSubscribed(true);
    toast.success("Successfully subscribed to the newsletter!");
  };

  return (
    <>
      <Helmet>
        <title>Newsletter - Embraix</title>
        <meta name="description" content="Subscribe to Embraix newsletter for weekly insights on clean energy, electric vehicles, and smart technologies." />
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

              <div className="max-w-3xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Newsletter</span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  Stay Ahead in{" "}
                  <span className="text-gradient">Sustainable Tech</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                  Get weekly curated insights, exclusive reports, and early access to content 
                  on clean energy, electric vehicles, and smart technologies.
                </p>

                {/* Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {benefits.map((benefit) => (
                    <Card key={benefit.title} className="bg-card/50 border-border/50">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <benefit.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-display font-semibold text-foreground mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Subscribe Form */}
                <Card className="bg-card border-border/50 max-w-md mx-auto">
                  <CardContent className="p-8">
                    {isSubscribed ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                          You're Subscribed!
                        </h3>
                        <p className="text-muted-foreground">
                          Thank you for subscribing. Check your inbox for a confirmation email.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="space-y-4">
                        <div>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-secondary/50 border-border/50"
                          />
                        </div>
                        <Button type="submit" variant="hero" className="w-full">
                          Subscribe Now
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        {!user && (
                          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            Sign in required to access full newsletter content
                          </p>
                        )}
                      </form>
                    )}
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

export default Newsletter;
