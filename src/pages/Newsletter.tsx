import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  TrendingUp, 
  BookOpen,
  Lock,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const benefits = [
  { icon: Zap, title: "Weekly Insights", description: "Curated updates on clean energy and EV trends" },
  { icon: TrendingUp, title: "Market Analysis", description: "Exclusive reports and industry forecasts" },
  { icon: BookOpen, title: "Early Access", description: "First look at new guides and tutorials" },
];

const Newsletter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.info("Please sign in to subscribe to the newsletter");
      navigate("/auth");
      return;
    }

    if (!user.email) {
      toast.error("No email address found. Please update your profile.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Subscribing user:", user.email);
      
      // Call the welcome email edge function with the user's authenticated email
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split("@")[0],
          source: "newsletter",
          userId: user.id,
        },
      });

      if (error) {
        console.error("Error sending welcome email:", error);
        toast.error("Failed to subscribe. Please try again.");
        return;
      }

      console.log("Newsletter subscription response:", data);
      setIsSubscribed(true);
      toast.success("Successfully subscribed! Check your inbox for a welcome email.");
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
                          Thank you for subscribing. Check your inbox for a welcome email.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="space-y-4">
                        {user ? (
                          <>
                            <div className="text-center mb-4">
                              <p className="text-sm text-muted-foreground">
                                Subscribing as: <span className="font-medium text-foreground">{user.email}</span>
                              </p>
                            </div>
                            <Button 
                              type="submit" 
                              variant="hero" 
                              className="w-full"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Subscribing...
                                </>
                              ) : (
                                <>
                                  Subscribe Now
                                  <ArrowRight className="ml-2 w-4 h-4" />
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              type="button" 
                              variant="hero" 
                              className="w-full"
                              onClick={() => navigate("/auth")}
                            >
                              Sign In to Subscribe
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                              <Lock className="w-3 h-3" />
                              Sign in required to subscribe
                            </p>
                          </>
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