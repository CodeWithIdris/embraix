import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompareFloatingBar = () => {
  const { compareItems, removeFromCompare, clearCompare, compareCount } = useCompare();
  const navigate = useNavigate();

  if (compareCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-elevated rounded-xl px-4 py-3 flex items-center gap-3 max-w-lg w-[calc(100%-2rem)]">
      <Badge className="bg-primary text-primary-foreground shrink-0">
        {compareCount}/4
      </Badge>

      <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none">
        {compareItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-1 bg-secondary/50 rounded-md px-2 py-1 text-xs shrink-0"
          >
            <span className="truncate max-w-[80px]">{item.name}</span>
            <button
              onClick={() => removeFromCompare(item.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={clearCompare} className="text-xs">
          Clear
        </Button>
        <Button
          size="sm"
          onClick={() => navigate("/store/compare")}
          disabled={compareCount < 2}
          className="gap-1 text-xs"
        >
          Compare <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default CompareFloatingBar;
