import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProviderRegistrationForm from "@/components/centre/ProviderRegistrationForm";
import { useAuth } from "@/hooks/useAuth";
import { useServiceProviders } from "@/hooks/useServiceProviders";
import { ArrowLeft, CheckCircle, Crown, Loader2 } from "lucide-react";

const ProviderRegister = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { myProvider, myProviderLoading } = useServiceProviders();

  if (authLoading || myProviderLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Register as Provider | Embraix Centre</title>
        </Helmet>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                Please sign in to register as a service provider
              </p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (myProvider) {
    return (
      <>
        <Helmet>
          <title>Already Registered | Embraix Centre</title>
        </Helmet>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold mb-2">You're Already Registered!</h2>
              <p className="text-muted-foreground mb-4">
                You already have a provider profile. Go to your dashboard to manage it.
              </p>
              <Button variant="hero" onClick={() => navigate("/centre/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Register as Provider | Embraix Centre</title>
        <meta name="description" content="Register as a service provider on Embraix and start offering your services." />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/centre")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Premium Notice */}
            <Card className="gradient-card border-primary/30 mb-8 overflow-hidden relative">
              <div className="absolute inset-0 gradient-glow opacity-30" />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <Badge className="bg-primary text-primary-foreground">Premium Required</Badge>
                </div>
                <CardTitle className="font-display text-xl">Premium Subscription</CardTitle>
        <CardDescription>
                  After registration, your application will be reviewed by our team. 
                  Once approved, you'll be able to list services and access your provider dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    List unlimited services
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Showcase your project portfolio
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Receive direct messages from customers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Get verified badge after review
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <ProviderRegistrationForm onSuccess={() => navigate("/centre/dashboard")} />
          </div>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default ProviderRegister;
