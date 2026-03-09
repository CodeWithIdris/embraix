import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MessageCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StoreProduct } from "@/hooks/useStoreProducts";

interface QuickRecommendationProps {
  products: StoreProduct[];
}

const QuickRecommendation = ({ products }: QuickRecommendationProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ usage: "", need: "", budget: "" });
  const [results, setResults] = useState<StoreProduct[]>([]);

  const questions = [
    {
      question: "Home or business?",
      options: [
        { label: "Small Home / Apartment", value: "small_home" },
        { label: "Medium Home", value: "medium_home" },
        { label: "Business / Commercial", value: "business" },
        { label: "Rural / Off-Grid", value: "rural" },
      ],
      key: "usage",
    },
    {
      question: "What do you need most?",
      options: [
        { label: "Solar Power Generation", value: "solar" },
        { label: "Battery / Backup Power", value: "battery" },
        { label: "EV Charging", value: "ev" },
        { label: "Complete Energy System", value: "complete" },
      ],
      key: "need",
    },
    {
      question: "Budget range?",
      options: [
        { label: "Under ₦200,000", value: "low" },
        { label: "₦200k – ₦500k", value: "mid" },
        { label: "₦500k – ₦2M", value: "high" },
        { label: "Above ₦2M", value: "premium" },
      ],
      key: "budget",
    },
  ];

  const getRecommendations = (a: typeof answers) => {
    let filtered = [...products];

    // Filter by usage/best_for
    const usageMap: Record<string, string[]> = {
      small_home: ["small homes", "apartments"],
      medium_home: ["medium homes", "all homes"],
      business: ["businesses", "commercial"],
      rural: ["rural areas", "off-grid", "outdoor"],
    };
    const terms = usageMap[a.usage] || [];
    if (terms.length) {
      const matched = filtered.filter((p) =>
        terms.some((t) => p.best_for?.toLowerCase().includes(t))
      );
      if (matched.length) filtered = matched;
    }

    // Filter by need
    const needMap: Record<string, string[]> = {
      solar: ["solar_panels"],
      battery: ["batteries"],
      ev: ["ev_chargers"],
      complete: ["bundles"],
    };
    const cats = needMap[a.need] || [];
    if (cats.length) {
      const matched = filtered.filter((p) => cats.includes(p.category));
      if (matched.length) filtered = matched;
    }

    // Filter by budget
    const budgetMap: Record<string, [number, number]> = {
      low: [0, 200000],
      mid: [200000, 500000],
      high: [500000, 2000000],
      premium: [2000000, 999999999],
    };
    const [min, max] = budgetMap[a.budget] || [0, 999999999];
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);

    return filtered.slice(0, 3);
  };

  const handleAnswer = (key: string, value: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResults(getRecommendations(newAnswers));
      setStep(questions.length);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({ usage: "", need: "", budget: "" });
    setResults([]);
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Find the Right Energy Solution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step < questions.length ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">{questions[step].question}</p>
            <div className="grid grid-cols-2 gap-2">
              {questions[step].options.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  className="h-auto py-3 text-xs text-left justify-start"
                  onClick={() => handleAnswer(questions[step].key, opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 mt-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Based on your needs, we recommend:
                </p>
                {results.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.best_for}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        minimumFractionDigits: 0,
                      }).format(p.price)}
                    </Badge>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No exact matches found. Try adjusting your preferences or ask our AI for help!
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={reset} className="text-xs">
                Start Over
              </Button>
              <Button
                size="sm"
                variant="glass"
                className="text-xs gap-1"
                onClick={() =>
                  navigate("/chat", {
                    state: { starterMessage: "Help me choose the right solar system for my needs." },
                  })
                }
              >
                <MessageCircle className="w-3 h-3" />
                Ask Embraix AI
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickRecommendation;
