import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useServiceProviders } from "@/hooks/useServiceProviders";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Search, 
  Users, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles
} from "lucide-react";

const CentreHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { providers, providersLoading, myProvider } = useServiceProviders();

  const featuredProviders = providers?.slice(0, 6) || [];

  return (
    <>
      <Helmet>
        <title>Service Centre | Embraix</title>
        <meta name="description" content="Find trusted service providers for consultation, installation, repair, and more on Embraix." />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 gradient-glow opacity-50" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Service Marketplace
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Find Trusted <span className="text-gradient">Service Providers</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Connect with verified professionals offering consultation, installation, 
                repair, sales, and more. Browse services, view portfolios, and get in touch directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" onClick={() => navigate("/centre/browse")}>
                  <Search className="w-4 h-4 mr-2" />
                  Browse Services
                </Button>
                {user && !myProvider && (
                  <Button variant="outline" size="lg" onClick={() => navigate("/centre/register")}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Become a Provider
                  </Button>
                )}
                {myProvider && (
                  <Button variant="outline" size="lg" onClick={() => navigate("/centre/dashboard")}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    My Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Service Providers", value: providers?.length || 0, icon: Users },
                { label: "Categories", value: 7, icon: Briefcase },
                { label: "Avg Rating", value: "4.8", icon: Star },
                { label: "Verified", value: providers?.filter(p => p.is_verified).length || 0, icon: CheckCircle },
              ].map((stat, idx) => (
                <Card key={idx} className="gradient-card border-border/50 text-center">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-display text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Providers</h2>
                <p className="text-muted-foreground">Top-rated service providers on Embraix</p>
              </div>
              <Button variant="ghost" onClick={() => navigate("/centre/browse")}>
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {providersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="gradient-card border-border/50 animate-pulse">
                    <div className="h-32 bg-muted" />
                    <CardContent className="pt-10 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-10 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProviders.map((provider) => (
                  <Card 
                    key={provider.id} 
                    className="gradient-card border-border/50 hover:shadow-elevated transition-all cursor-pointer group"
                    onClick={() => navigate(`/centre/provider/${provider.id}`)}
                  >
                    <div className="relative h-24 bg-gradient-to-br from-primary/20 to-accent/10">
                      {provider.cover_image && (
                        <img src={provider.cover_image} alt="" className="w-full h-full object-cover" />
                      )}
                      {provider.is_verified && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
                        {provider.business_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {provider.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            {Number(provider.rating).toFixed(1)}
                          </span>
                        )}
                        <span className="capitalize">{provider.business_type}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {provider.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs capitalize">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No providers yet. Be the first to register!</p>
                  {user && (
                    <Button variant="hero" className="mt-4" onClick={() => navigate("/centre/register")}>
                      Register as Provider
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="gradient-card border-border/50 overflow-hidden relative">
              <div className="absolute inset-0 gradient-glow opacity-30" />
              <CardContent className="py-12 relative">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                    Ready to Offer Your Services?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Join Embraix as a service provider and reach customers looking for your expertise. 
                    Showcase your portfolio, manage inquiries, and grow your business.
                  </p>
                  {!user ? (
                    <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                      Sign In to Get Started
                    </Button>
                  ) : myProvider ? (
                    <Button variant="hero" size="lg" onClick={() => navigate("/centre/dashboard")}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button variant="hero" size="lg" onClick={() => navigate("/centre/register")}>
                      Become a Provider
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default CentreHome;
