import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, TrendingUp, Users, Clock } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    title: "Solar-Powered Irrigation Transforms Nigerian Farm",
    location: "Kano, Nigeria",
    industry: "Agriculture",
    result: "40% increase in crop yield",
    description: "How a 500-hectare farm eliminated diesel dependency and improved water management through integrated solar pumping systems.",
    duration: "6 months",
    teamSize: "12 specialists",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Commercial Building Energy Independence",
    location: "Lagos, Nigeria",
    industry: "Commercial",
    result: "85% energy cost reduction",
    description: "A 20-story office complex achieved near-complete energy independence with rooftop solar and battery storage.",
    duration: "14 months",
    teamSize: "8 specialists",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Rural Community Microgrid Project",
    location: "Ogun State, Nigeria",
    industry: "Community",
    result: "500+ homes powered",
    description: "Bringing reliable electricity to a previously unconnected rural community through solar microgrids.",
    duration: "18 months",
    teamSize: "15 specialists",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Smart Greenhouse Automation",
    location: "Ibadan, Nigeria",
    industry: "AgriTech",
    result: "3x production capacity",
    description: "Integrating solar power with IoT sensors and automated climate control for year-round vegetable production.",
    duration: "8 months",
    teamSize: "6 specialists",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
  },
];

const CaseStudies = () => {
  return (
    <>
      <Helmet>
        <title>Case Studies | Embraix</title>
        <meta name="description" content="Explore success stories and real-world examples of solar energy and agricultural technology implementations." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Success Stories</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Case Studies
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-world examples of how businesses and communities have transformed 
                their operations with solar energy and smart technology.
              </p>
            </div>

            {/* Case Studies Grid */}
            <div className="space-y-8 max-w-5xl mx-auto">
              {caseStudies.map((study, index) => (
                <Card 
                  key={study.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50"
                >
                  <div className={`grid md:grid-cols-2 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    <div 
                      className="h-64 md:h-auto bg-cover bg-center"
                      style={{ backgroundImage: `url(${study.image})` }}
                    />
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge>{study.industry}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="w-3 h-3" />
                          {study.location}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-foreground">
                        {study.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4">
                        {study.description}
                      </p>

                      <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <span className="flex items-center gap-1.5 text-primary font-medium">
                          <TrendingUp className="w-4 h-4" />
                          {study.result}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {study.duration}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {study.teamSize}
                        </span>
                      </div>

                      <Button variant="outline" className="w-fit gap-2 group">
                        Read Full Case Study
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <h3 className="text-xl font-semibold mb-2">Ready to Write Your Success Story?</h3>
                  <p className="text-muted-foreground mb-4">
                    Let's discuss how we can help transform your business with sustainable solutions.
                  </p>
                  <Button>Start Your Project</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CaseStudies;
