import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const FloatingAIConsult = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (user) {
      navigate("/chat");
    } else {
      if (isExpanded) {
        navigate("/auth");
      } else {
        setIsExpanded(true);
      }
    }
  };

  if (isExpanded && !user) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated max-w-xs">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-sm">AI Consultant</h4>
              <p className="text-xs text-muted-foreground">Get instant answers</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to access our free AI-powered clean energy consultant.
          </p>
          <Button variant="hero" size="sm" className="w-full" onClick={handleClick}>
            Sign In to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated hover:scale-105 transition-transform flex items-center justify-center animate-float"
      aria-label="AI Consultant"
    >
      <MessageSquare className="w-6 h-6" />
    </button>
  );
};
