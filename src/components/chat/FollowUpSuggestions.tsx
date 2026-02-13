import { useState, useEffect } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";

interface FollowUpSuggestionsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const allSuggestions = [
  "Tell me more about this",
  "What are the costs involved?",
  "How do I get started?",
  "Any alternatives you recommend?",
  "What's the ROI on this?",
  "How long does installation take?",
  "What permits are needed?",
  "Compare pros and cons",
  "What maintenance is required?",
  "Are there financing options?",
  "What incentives are available?",
  "How does this affect resale value?",
  "What's the payback period?",
  "Can you explain in simpler terms?",
  "What brands do you recommend?",
];

const getRandomSuggestions = (count: number = 3): string[] => {
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const FollowUpSuggestions = ({ onSelect, disabled }: FollowUpSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setSuggestions(getRandomSuggestions(3));
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const refreshSuggestions = () => {
    setVisible(false);
    setTimeout(() => {
      setSuggestions(getRandomSuggestions(3));
      setVisible(true);
    }, 200);
  };

  return (
    <div className={`mt-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-3 h-3 text-primary/60" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Follow up</span>
        <button
          onClick={refreshSuggestions}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh suggestions"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
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
