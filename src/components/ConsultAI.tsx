import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const ConsultAI = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section id="consult" className="py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      <div className="container mx-auto px-4 relative z-10">
        <Card className="max-w-3xl mx-auto bg-card border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left - Content */}
              <div className="p-8 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Powered</span>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                  Free Expert Guidance
                </h2>

                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Get instant, personalized consultation on clean energy, EVs, 
                  and smart technologies. Our AI delivers tailored guidance.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="hero" 
                    onClick={() => navigate(user ? "/chat" : "/auth")}
                  >
                    {user ? "Start Chatting" : "Try Free"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/consult-expert")}
                  >
                    Talk to Expert
                  </Button>
                </div>
              </div>

              {/* Right - Visual */}
              <div className="bg-secondary/30 p-8 flex items-center justify-center border-l border-border/50 hidden md:flex">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                    <Bot className="w-12 h-12 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center animate-float">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ConsultAI;
