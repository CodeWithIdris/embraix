import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Share2, FileDown, TrendingUp } from "lucide-react";

const GrowthAnalytics = () => {
  const [stats, setStats] = useState({
    waitlistUsers: 0,
    referralCount: 0,
    newsletterSubs: 0,
    totalPosts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [waitlist, referrals, newsletter, posts] = await Promise.all([
      (supabase as any).from("waitlist_users").select("id", { count: "exact", head: true }),
      (supabase as any).from("referrals").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscriptions").select("id", { count: "exact", head: true }),
      supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "approved"),
    ]);

    setStats({
      waitlistUsers: waitlist.count || 0,
      referralCount: referrals.count || 0,
      newsletterSubs: newsletter.count || 0,
      totalPosts: posts.count || 0,
    });
  };

  const cards = [
    { label: "Waitlist Users", value: stats.waitlistUsers, icon: Users, color: "text-blue-500" },
    { label: "Referrals", value: stats.referralCount, icon: Share2, color: "text-green-500" },
    { label: "Newsletter Subscribers", value: stats.newsletterSubs, icon: FileDown, color: "text-orange-500" },
    { label: "Published Posts", value: stats.totalPosts, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-bold text-foreground">Growth Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="gradient-card border-border/50">
            <CardContent className="p-4 text-center">
              <c.icon className={`w-6 h-6 mx-auto mb-2 ${c.color}`} />
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GrowthAnalytics;
