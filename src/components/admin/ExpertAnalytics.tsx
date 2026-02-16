import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, MessageSquare, Clock, CheckCircle, TrendingUp, Award } from "lucide-react";
import { format } from "date-fns";

interface ExpertStat {
  expert_id: string;
  expert_name: string | null;
  expert_email: string | null;
  total_chats: number;
  active_chats: number;
  closed_chats: number;
  total_messages: number;
  avg_response_time_label: string;
}

export const ExpertAnalytics = () => {
  const [stats, setStats] = useState<ExpertStat[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalChats: 0,
    activeChats: 0,
    waitingChats: 0,
    closedChats: 0,
    totalExperts: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get all expert chats
      const { data: chats } = await supabase
        .from("expert_chats")
        .select("*");

      // Get all expert chat messages
      const { data: messages } = await supabase
        .from("expert_chat_messages")
        .select("*");

      // Get expert user ids
      const { data: expertRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "expert");

      const expertIds = expertRoles?.map(r => r.user_id) || [];

      // Get expert profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", expertIds.length > 0 ? expertIds : ["none"]);

      const allChats = chats || [];
      const allMessages = messages || [];

      // Global stats
      setGlobalStats({
        totalChats: allChats.length,
        activeChats: allChats.filter(c => c.status === "active").length,
        waitingChats: allChats.filter(c => c.status === "waiting").length,
        closedChats: allChats.filter(c => c.status === "closed").length,
        totalExperts: expertIds.length,
        totalMessages: allMessages.length,
      });

      // Per-expert stats
      const expertStats: ExpertStat[] = (profiles || []).map(profile => {
        const expertChats = allChats.filter(c => c.expert_id === profile.id);
        const expertMessages = allMessages.filter(m =>
          m.sender_id === profile.id
        );

        return {
          expert_id: profile.id,
          expert_name: profile.full_name,
          expert_email: profile.email,
          total_chats: expertChats.length,
          active_chats: expertChats.filter(c => c.status === "active").length,
          closed_chats: expertChats.filter(c => c.status === "closed").length,
          total_messages: expertMessages.length,
          avg_response_time_label: expertChats.length > 0 ? "Active" : "No activity",
        };
      });

      // Sort by total chats desc
      expertStats.sort((a, b) => b.total_chats - a.total_chats);
      setStats(expertStats);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.totalExperts}</p>
            <p className="text-xs text-muted-foreground">Total Experts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <MessageSquare className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.totalChats}</p>
            <p className="text-xs text-muted-foreground">Total Chats</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.activeChats}</p>
            <p className="text-xs text-muted-foreground">Active Now</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.waitingChats}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <CheckCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.closedChats}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <MessageSquare className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{globalStats.totalMessages}</p>
            <p className="text-xs text-muted-foreground">Messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Expert Leaderboard */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Expert Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No experts registered yet</p>
          ) : (
            <div className="space-y-3">
              {stats.map((expert, index) => (
                <div
                  key={expert.expert_id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{expert.expert_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{expert.expert_email}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm shrink-0">
                    <div className="text-center">
                      <p className="font-bold">{expert.total_chats}</p>
                      <p className="text-xs text-muted-foreground">Chats</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{expert.total_messages}</p>
                      <p className="text-xs text-muted-foreground">Msgs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-500">{expert.active_chats}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
