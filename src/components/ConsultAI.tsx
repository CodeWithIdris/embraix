import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Sparkles, Users, Globe, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: CheckCircle, text: "Free rapid consultations" },
  { icon: CheckCircle, text: "AI-powered recommendations" },
  { icon: CheckCircle, text: "Expert industry insights" },
  { icon: CheckCircle, text: "Africa-focused solutions" },
];

const ConsultAI = () => {
  return (
    <section id="consult" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-1/2 left-0 w-1/2 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-6">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Embraix Consult & AI</span>
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              Free Expert Guidance{" "}
              <span className="text-gradient">Powered by AI</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Get rapid, personalized consultation on clean energy, electric vehicles, 
              and smart technologies. Our AI-enhanced platform delivers tailored guidance 
              to help you navigate challenges and seize opportunities.
            </p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              Start Free Consultation
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Right - AI Chat Preview */}
          <div className="relative">
            <Card className="gradient-card border-border/50 shadow-elevated overflow-hidden">
              <CardContent className="p-0">
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">Embraix AI</h4>
                    <span className="text-xs text-primary flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[300px]">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-foreground">
                        I want to set up a solar installation for my business in Lagos. What should I consider?
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                      <p className="text-sm text-foreground mb-3">
                        Great choice! Here are key factors for your Lagos solar installation:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Load Assessment:</strong> Calculate your daily energy consumption</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Panel Capacity:</strong> Nigeria averages 5.5 peak sun hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">Battery Storage:</strong> Essential for backup during outages</span>
                        </li>
                      </ul>
                      <p className="text-sm text-primary mt-3">Would you like detailed cost estimates? →</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Ask about clean energy, EVs, or smart tech..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button size="sm" variant="hero" className="h-8 px-4">
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-card border border-border/50 rounded-xl p-4 shadow-elevated animate-float">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-display font-bold text-foreground">2,500+</div>
                  <div className="text-xs text-muted-foreground">Consultations</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card border border-border/50 rounded-xl p-4 shadow-elevated animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-primary" />
                <div>
                  <div className="font-display font-bold text-foreground">15+</div>
                  <div className="text-xs text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultAI;
