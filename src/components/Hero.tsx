import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Leaf, Cpu, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      
      {/* Subtle Glow Effects */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Powering Africa's Sustainable Future</span>
          </div>

          {/* Main Heading */}
          <h1 
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-slide-up"
          >
            Clean Energy,{" "}
            <span className="text-gradient">Electric Vehicles</span>
            <br className="hidden sm:block" />
            & Smart Technologies
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Your comprehensive platform for knowledge, innovation, and collaboration 
            in sustainable technologies. Empowering Africa and the world.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button 
              variant="hero" 
              size="lg"
              className="min-w-[180px] h-12"
              onClick={() => navigate("/media/news")}
            >
              Explore Platform
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="min-w-[180px] h-12 gap-2"
              onClick={() => navigate(user ? "/chat" : "/auth")}
            >
              <Play className="w-4 h-4" />
              Free Consultation
            </Button>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-center group">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">10k+</div>
              <div className="text-sm text-muted-foreground">Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
    </section>
  );
};

export default Hero;
