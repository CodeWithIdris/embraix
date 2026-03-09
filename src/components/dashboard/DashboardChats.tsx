import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChatHistory } from "@/hooks/useDashboard";
import { MessageSquare, ArrowRight, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

const DashboardChats = () => {
  const navigate = useNavigate();
  const { data: chats, isLoading } = useChatHistory();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">AI Chat History</h2>
        <Button size="sm" variant="hero" onClick={() => navigate("/chat")}>
          <Plus className="w-4 h-4 mr-1" /> New Chat
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !chats?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No conversations yet</p>
            <Button variant="hero" size="sm" className="mt-4" onClick={() => navigate("/chat")}>
              Start a conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="gradient-card border-border/50 hover:shadow-elevated transition-all cursor-pointer"
              onClick={() => navigate(`/chat?conversation=${chat.id}`)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{chat.title || "Untitled Chat"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(chat.updated_at || chat.created_at!), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardChats;
