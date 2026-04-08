import { useState, useEffect, useMemo } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";

interface FollowUpSuggestionsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
  lastMessage?: string;
}

// Context-based follow-up generation
const getContextualSuggestions = (lastMessage: string): string[] => {
  const lower = lastMessage.toLowerCase();

  if (lower.includes("solar") || lower.includes("panel")) {
    return [
      "What size system do I need?",
      "Show me cheaper options",
      "How long is the payback period?",
      "Request installation quote",
    ];
  }
  if (lower.includes("battery") || lower.includes("storage")) {
    return [
      "Compare lithium vs lead-acid",
      "What capacity do I need?",
      "Show me battery options",
      "How long will it last?",
    ];
  }
  if (lower.includes("inverter")) {
    return [
      "What wattage do I need?",
      "Show me inverter options",
      "Hybrid vs standard inverter?",
      "What brand is most reliable?",
    ];
  }
  if (lower.includes("ev") || lower.includes("electric vehicle") || lower.includes("car")) {
    return [
      "Compare EV running costs",
      "Show me charging options",
      "Best EV for Nigerian roads?",
      "How much does charging cost?",
    ];
  }
  if (lower.includes("cost") || lower.includes("price") || lower.includes("budget")) {
    return [
      "Show me cheaper alternatives",
      "Are there financing options?",
      "Calculate my ROI",
      "What incentives are available?",
    ];
  }
  if (lower.includes("install") || lower.includes("setup")) {
    return [
      "What permits are needed?",
      "Find an installer near me",
      "How long does it take?",
      "What maintenance is required?",
    ];
  }
  if (lower.includes("[products:")) {
    return [
      "Compare these products",
      "Show me cheaper options",
      "Which one is best for me?",
      "Request installation",
    ];
  }

  // Default contextual
  return [
    "Tell me more about this",
    "What are the costs?",
    "Show me product options",
    "Help me get started",
  ];
};

const FollowUpSuggestions = ({ onSelect, disabled, lastMessage }: FollowUpSuggestionsProps) => {
  const [visible, setVisible] = useState(false);

  const suggestions = useMemo(() => {
    return getContextualSuggestions(lastMessage || "");
  }, [lastMessage]);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, [lastMessage]);

  return (
    <div className={`mt-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-3 h-3 text-primary/60" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Suggested</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.slice(0, 3).map((suggestion, i) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-3 py-1.5 text-xs bg-primary/5 border border-primary/15 rounded-full text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpSuggestions;
