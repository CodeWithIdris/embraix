import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

// Static trending topics for MVP - can be made dynamic later
const trendingTopics = [
  { label: "Solar Mini-Grids", query: "solar mini-grid" },
  { label: "EV Charging", query: "ev charging" },
  { label: "Energy Storage", query: "energy storage" },
  { label: "Clean Cooking", query: "clean cooking" },
  { label: "Smart Meters", query: "smart meters" },
  { label: "Renewable Policy", query: "renewable policy" },
];

interface TrendingTagsProps {
  variant?: "inline" | "block";
  maxTags?: number;
}

export const TrendingTags = ({ variant = "inline", maxTags = 6 }: TrendingTagsProps) => {
  const navigate = useNavigate();
  const tags = trendingTopics.slice(0, maxTags);

  const handleTagClick = (query: string) => {
    // Navigate to explore with search query
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  if (variant === "block") {
    return (
      <div className="p-4 rounded-xl border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending on Embraix</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.label}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => handleTagClick(tag.query)}
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        Trending:
      </span>
      {tags.map((tag) => (
        <Badge
          key={tag.label}
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 text-xs transition-colors"
          onClick={() => handleTagClick(tag.query)}
        >
          {tag.label}
        </Badge>
      ))}
    </div>
  );
};
