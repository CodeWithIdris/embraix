import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Newspaper, 
  Zap, 
  Car, 
  Sun, 
  Battery, 
  FileText, 
  Users,
  ShoppingBag,
  MessageSquare,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const ONBOARDING_COMPLETED_KEY = "embraix_onboarding_completed";

const interests = [
  { id: "solar", label: "Solar Energy", icon: Sun, color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  { id: "ev", label: "Electric Vehicles", icon: Car, color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { id: "battery", label: "Energy Storage", icon: Battery, color: "bg-green-500/20 text-green-600 dark:text-green-400" },
  { id: "ai", label: "AI & Smart Tech", icon: Sparkles, color: "bg-purple-500/20 text-purple-600 dark:text-purple-400" },
  { id: "reports", label: "Industry Reports", icon: FileText, color: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  { id: "news", label: "Clean Energy News", icon: Newspaper, color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400" },
];

const quickActions = [
  { 
    label: "Ask the AI", 
    description: "Get instant answers about clean energy",
    href: "/chat", 
    icon: MessageSquare,
    color: "bg-primary/10 hover:bg-primary/20 border-primary/20"
  },
  { 
    label: "Explore News", 
    description: "Latest clean energy updates",
    href: "/media", 
    icon: Newspaper,
    color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20"
  },
  { 
    label: "Browse Products", 
    description: "Solar, batteries & more",
    href: "/store", 
    icon: ShoppingBag,
    color: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
  },
  { 
    label: "Find an Expert", 
    description: "Connect with professionals",
    href: "/centre", 
    icon: Users,
    color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20"
  },
];

export const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!completed) {
      // Show after a slight delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    if (selectedInterests.length > 0) {
      localStorage.setItem("embraix_user_interests", JSON.stringify(selectedInterests));
    }
    setIsOpen(false);
  };

  const handleQuickAction = (href: string) => {
    handleComplete();
    navigate(href);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 1 && (
          <>
            <DialogHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold">Welcome to Embraix</DialogTitle>
              <DialogDescription className="text-base">
                Your platform for clean energy knowledge, AI insights, and smart technology solutions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground text-center">
                What topics interest you? (Select any that apply)
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${interest.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{interest.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-xl font-bold">What would you like to do first?</DialogTitle>
              <DialogDescription>
                Choose an action to get started
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.href}
                    onClick={() => handleQuickAction(action.href)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${action.color}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button variant="outline" onClick={handleComplete} className="flex-1">
                Just Explore
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
