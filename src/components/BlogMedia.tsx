import { Button } from "@/components/ui/button";
import { 
  Newspaper, 
  Megaphone,
  ArrowRight,
  Users,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const BlogMedia = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section id="blog" className="py-10 relative overflow-hidden bg-card">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate("/news")}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Newspaper className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">News</span>
            </button>
            
            <button
              onClick={() => navigate("/promotions")}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Megaphone className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Promos</span>
            </button>

            <button
              onClick={() => navigate(user ? "/chat" : "/auth")}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">AI Chat</span>
            </button>

            <button
              onClick={() => navigate("/consult-expert")}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-secondary/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Experts</span>
            </button>
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/blog")}
              className="text-muted-foreground hover:text-primary"
            >
              Browse Articles
              <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogMedia;
