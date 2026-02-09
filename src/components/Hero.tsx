import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      {/* Subtle Glow Effect */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5 animate-fade-in"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">Powering Africa's Sustainable Future</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-4 animate-slide-up"
          >
            Clean Energy,{" "}
            <span className="text-gradient">EVs</span>
            {" "}& Smart Tech
          </h1>

          {/* Subtitle */}
          <p 
            className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-6 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Your platform for knowledge, innovation, and collaboration 
            in sustainable technologies.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button 
              variant="hero" 
              size="default"
              className="min-w-[140px]"
              onClick={() => navigate("/news")}
            >
              Explore
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="default"
              className="min-w-[140px] gap-2"
              onClick={() => navigate(user ? "/chat" : "/auth")}
            >
              <Play className="w-4 h-4" />
              AI Consult
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
    </section>
  );
};

export default Hero;
