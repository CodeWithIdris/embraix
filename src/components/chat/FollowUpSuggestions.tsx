import { Lightbulb } from "lucide-react";

interface FollowUpSuggestionsProps {
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const suggestions = [
  "Tell me more about this",
  "What are the costs involved?",
  "How do I get started?",
  "Any alternatives you recommend?",
];

const FollowUpSuggestions = ({ onSelect, disabled }: FollowUpSuggestionsProps) => {
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