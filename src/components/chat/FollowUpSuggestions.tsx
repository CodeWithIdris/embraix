import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";

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
];

const getRandomSuggestions = (count: number = 4): string[] => {
  const shuffled = [...allSuggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const FollowUpSuggestions = ({ onSelect, disabled }: FollowUpSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions(getRandomSuggestions(4));
  }, []);

  const refreshSuggestions = () => {
    setSuggestions(getRandomSuggestions(4));
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary/50 border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb className="w-3 h-3" />
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default FollowUpSuggestions;