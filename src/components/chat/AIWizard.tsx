import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Home, Building2, Zap, ShoppingBag, Compass,
  Lightbulb, Fan, Tv, ThermometerSnowflake, Laptop, PlugZap,
  ArrowRight, ArrowLeft, Loader2, CheckCircle,
} from "lucide-react";

interface WizardData {
  intent: string;
  size: string;
  appliances: string[];
  budget: string;
  location: string;
}

const STEPS = [
  { id: "intent", title: "What are you looking for?", subtitle: "Select your primary goal" },
  { id: "size", title: "What describes your setup?", subtitle: "This helps us size recommendations" },
  { id: "appliances", title: "What do you want to power?", subtitle: "Select all that apply" },
  { id: "budget", title: "What's your budget range?", subtitle: "We'll match solutions to your budget" },
  { id: "location", title: "Where are you located?", subtitle: "For region-specific recommendations" },
];

const INTENTS = [
  { id: "home", label: "Power my home", icon: Home },
  { id: "business", label: "Power my business", icon: Building2 },
  { id: "savings", label: "Reduce electricity bills", icon: Zap },
  { id: "buy", label: "Buy a product", icon: ShoppingBag },
  { id: "explore", label: "Just exploring", icon: Compass },
];

const SIZES = [
  { id: "small", label: "Small", desc: "1-2 bedroom / Small office" },
  { id: "medium", label: "Medium", desc: "3-4 bedroom / Medium office" },
  { id: "large", label: "Large", desc: "5+ bedroom / Large facility" },
];

const APPLIANCES = [
  { id: "lights", label: "Lights", icon: Lightbulb },
  { id: "fans", label: "Fans", icon: Fan },
  { id: "tv", label: "TV", icon: Tv },
  { id: "fridge", label: "Fridge", icon: ThermometerSnowflake },
  { id: "ac", label: "AC", icon: ThermometerSnowflake },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "others", label: "Others", icon: PlugZap },
];

const BUDGETS = [
  { id: "low", label: "Budget Friendly", desc: "Under ₦500,000" },
  { id: "medium", label: "Mid Range", desc: "₦500K – ₦1.5M" },
  { id: "high", label: "Premium", desc: "₦1.5M+" },
  { id: "unsure", label: "Not sure yet", desc: "Help me decide" },
];

const LOCATIONS = [
  "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Accra", "Nairobi", "Other",
];

interface AIWizardProps {
  onComplete: (data: WizardData) => void;
  onSkip: () => void;
}

const AIWizard = ({ onComplete, onSkip }: AIWizardProps) => {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<WizardData>({
    intent: "", size: "", appliances: [], budget: "", location: "",
  });

  const progress = ((step + 1) / STEPS.length) * 100;
  const canProceed =
    (step === 0 && data.intent) ||
    (step === 1 && data.size) ||
    (step === 2 && data.appliances.length > 0) ||
    (step === 3 && data.budget) ||
    (step === 4 && data.location);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setProcessing(true);
      // Store in localStorage for chat context
      localStorage.setItem("embraix_wizard_data", JSON.stringify(data));
      setTimeout(() => {
        setProcessing(false);
        onComplete(data);
      }, 1500);
    }
  };

  const toggleAppliance = (id: string) => {
    setData(prev => ({
      ...prev,
      appliances: prev.appliances.includes(id)
        ? prev.appliances.filter(a => a !== id)
        : [...prev.appliances, id],
    }));
  };

  if (processing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Analyzing your needs...</h2>
        <p className="text-sm text-muted-foreground">Finding the best solutions for you</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 max-w-lg mx-auto animate-fade-in">
      {/* Progress */}
      <div className="w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
          <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip & Chat Instead
          </button>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Title */}
      <h2 className="font-display text-xl font-bold text-foreground mb-1 text-center">{STEPS[step].title}</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">{STEPS[step].subtitle}</p>

      {/* Step Content */}
      <div className="w-full space-y-2 mb-6">
        {step === 0 && INTENTS.map(item => (
          <button
            key={item.id}
            onClick={() => setData({ ...data, intent: item.id })}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
              data.intent === item.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-foreground" />
            </div>
            <span className="font-medium text-sm">{item.label}</span>
            {data.intent === item.id && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
          </button>
        ))}

        {step === 1 && SIZES.map(item => (
          <button
            key={item.id}
            onClick={() => setData({ ...data, size: item.id })}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
              data.size === item.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {data.size === item.id && <CheckCircle className="w-4 h-4 text-primary" />}
          </button>
        ))}

        {step === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {APPLIANCES.map(item => (
              <button
                key={item.id}
                onClick={() => toggleAppliance(item.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  data.appliances.includes(item.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
                {data.appliances.includes(item.id) && <CheckCircle className="w-3.5 h-3.5 text-primary ml-auto" />}
              </button>
            ))}
          </div>
        )}

        {step === 3 && BUDGETS.map(item => (
          <button
            key={item.id}
            onClick={() => setData({ ...data, budget: item.id })}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
              data.budget === item.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
            }`}
          >
            <div>
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {data.budget === item.id && <CheckCircle className="w-4 h-4 text-primary" />}
          </button>
        ))}

        {step === 4 && (
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => setData({ ...data, location: loc })}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  data.location === loc
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 w-full">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 gap-1"
          variant="hero"
        >
          {step === STEPS.length - 1 ? "Get Recommendations" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIWizard;
