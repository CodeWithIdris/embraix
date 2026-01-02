import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Megaphone, 
  ArrowLeft, 
  Zap, 
  Percent, 
  Calendar,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const promotions = [
  {
    title: "Solar Panel Installation Discount",
    description: "Get 15% off on residential solar panel installations this month. Limited offer for new customers.",
    discount: "15% OFF",
    validUntil: "Jan 31, 2026",
    category: "Solar Energy",
  },
  {
    title: "EV Charging Station Bundle",
    description: "Complete home charging setup including installation, Level 2 charger, and 1-year maintenance.",
    discount: "Bundle Deal",
    validUntil: "Feb 15, 2026",
    category: "Electric Vehicles",
  },
  {
    title: "Smart Home Starter Kit",
    description: "IoT sensors, smart thermostat, and energy monitor bundled together at a special price.",
    discount: "20% OFF",
    validUntil: "Ongoing",
    category: "Smart Tech",
  },
];

const Promotions = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Promotions - Embraix</title>
        <meta name="description" content="Explore current promotions on clean energy products, EV charging solutions, and smart technology." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

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

              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
                    <Megaphone className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Promotions</span>
                  </div>

                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
                    Current <span className="text-gradient">Deals & Offers</span>
                  </h1>

                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore exclusive promotions on clean energy products, electric vehicle solutions, 
                    and smart technology from our partners.
                  </p>
                </div>

                {/* Promotions List */}
                <div className="space-y-6">
                  {promotions.map((promo, index) => (
                    <Card 
                      key={index} 
                      className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                {promo.category}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                                <Percent className="w-3.5 h-3.5" />
                                {promo.discount}
                              </span>
                            </div>
                            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                              {promo.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {promo.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              Valid until: {promo.validUntil}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button variant="hero" size="sm">
                              View Offer
                              <ExternalLink className="ml-2 w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State Info */}
                <div className="mt-12 text-center">
                  <Card className="bg-secondary/30 border-border/50">
                    <CardContent className="p-8">
                      <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        Partner With Us
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Are you a clean energy or smart tech company looking to reach our audience? 
                        Feature your promotions on Embraix.
                      </p>
                      <Button variant="outline" size="sm">
                        Contact Us
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Promotions;
