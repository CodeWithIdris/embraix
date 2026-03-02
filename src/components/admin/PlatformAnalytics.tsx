import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Users, Building2, Newspaper, Clock, MessageSquare,
  TrendingUp, FileText, Ticket, GraduationCap, BarChart3
} from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  activeProviders: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  totalArticles: number;
  totalComments: number;
  totalTickets: number;
  openTickets: number;
  totalExperts: number;
}

export const PlatformAnalytics = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalProviders },
        { count: pendingProviders },
        { count: activeProviders },
        { count: totalPosts },
        { count: pendingPosts },
        { count: approvedPosts },
        { count: totalArticles },
        { count: totalComments },
        { count: totalTickets },
        { count: openTickets },
        { count: totalExperts },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("service_providers").select("*", { count: "exact", head: true }),
        supabase.from("service_providers").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("service_providers").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("news_posts").select("*", { count: "exact", head: true }),
        supabase.from("news_posts").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("news_posts").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("post_comments").select("*", { count: "exact", head: true }),
        supabase.from("consultation_tickets").select("*", { count: "exact", head: true }),
        supabase.from("consultation_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "expert"),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        pendingProviders: pendingProviders || 0,
        activeProviders: activeProviders || 0,
        totalPosts: totalPosts || 0,
        pendingPosts: pendingPosts || 0,
        approvedPosts: approvedPosts || 0,
        totalArticles: totalArticles || 0,
        totalComments: totalComments || 0,
        totalTickets: totalTickets || 0,
        openTickets: openTickets || 0,
        totalExperts: totalExperts || 0,
      });
    } catch (err) {
      console.error("Error loading platform stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-primary" },
    { icon: Building2, label: "Total Providers", value: stats.totalProviders, color: "text-primary" },
    { icon: Clock, label: "Pending Providers", value: stats.pendingProviders, color: "text-amber-500" },
    { icon: Building2, label: "Active Providers", value: stats.activeProviders, color: "text-green-500" },
    { icon: Newspaper, label: "Total Posts", value: stats.totalPosts, color: "text-primary" },
    { icon: Clock, label: "Pending Posts", value: stats.pendingPosts, color: "text-amber-500" },
    { icon: TrendingUp, label: "Published Posts", value: stats.approvedPosts, color: "text-green-500" },
    { icon: FileText, label: "Blog Articles", value: stats.totalArticles, color: "text-primary" },
    { icon: MessageSquare, label: "Comments", value: stats.totalComments, color: "text-primary" },
    { icon: Ticket, label: "Total Tickets", value: stats.totalTickets, color: "text-primary" },
    { icon: Clock, label: "Open Tickets", value: stats.openTickets, color: "text-amber-500" },
    { icon: GraduationCap, label: "Experts", value: stats.totalExperts, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl font-bold">Platform Overview</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
