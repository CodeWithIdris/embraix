import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, BarChart3, Eye, ShoppingBag, MessageSquare, FileDown,
  Wrench, GraduationCap, TrendingUp, Zap, Search, Users, Mail, UserPlus,
  Newspaper, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type TimeRange = "7d" | "30d" | "90d";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>("30d");
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [dailyTrend, setDailyTrend] = useState<{ date: string; count: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; views: number }[]>([]);
  const [topPages, setTopPages] = useState<{ page: string; views: number }[]>([]);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0, waitlistUsers: 0, newsletterSubs: 0, totalPosts: 0, totalProducts: 0, totalConsultations: 0,
  });
  const [aiQueries, setAiQueries] = useState<{ query: string; count: number }[]>([]);
  const [featureUsage, setFeatureUsage] = useState<{ name: string; value: number }[]>([]);
  const [growthData, setGrowthData] = useState<{ date: string; waitlist: number; newsletter: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const getRangeDate = () => {
    const d = new Date();
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const loadAnalytics = async () => {
    setLoading(true);
    const since = getRangeDate();

    try {
      // Load analytics events + platform stats in parallel
      const [eventsRes, usersRes, waitlistRes, newsletterRes, postsRes, productsRes, consultRes] = await Promise.all([
        (supabase as any).from("analytics_events")
          .select("event_type, resource_id, resource_type, metadata, created_at")
          .gte("created_at", since)
          .order("created_at", { ascending: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        (supabase as any).from("waitlist_users").select("id, created_at").order("created_at", { ascending: true }),
        supabase.from("newsletter_subscriptions").select("id, subscribed_at").order("subscribed_at", { ascending: true }),
        supabase.from("news_posts").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("store_products").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("consultation_tickets").select("id", { count: "exact", head: true }),
      ]);

      setPlatformStats({
        totalUsers: usersRes.count || 0,
        waitlistUsers: waitlistRes.data?.length || 0,
        newsletterSubs: newsletterRes.data?.length || 0,
        totalPosts: postsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalConsultations: consultRes.count || 0,
      });

      // Growth data (waitlist + newsletter over time)
      const growthMap: Record<string, { waitlist: number; newsletter: number }> = {};
      let wCum = 0;
      (waitlistRes.data || []).forEach((w: any) => {
        const day = w.created_at?.slice(0, 10);
        if (day) { wCum++; growthMap[day] = { ...growthMap[day], waitlist: wCum, newsletter: growthMap[day]?.newsletter || 0 }; }
      });
      let nCum = 0;
      (newsletterRes.data || []).forEach((n: any) => {
        const day = n.subscribed_at?.slice(0, 10);
        if (day) { nCum++; growthMap[day] = { waitlist: growthMap[day]?.waitlist || wCum, newsletter: nCum }; }
      });
      setGrowthData(Object.entries(growthMap).slice(-30).map(([date, d]) => ({ date: date.slice(5), ...d })));

      const events = eventsRes.data || [];

      // Count by event type
      const counts: Record<string, number> = {};
      events.forEach((e: any) => { counts[e.event_type] = (counts[e.event_type] || 0) + 1; });
      setEventCounts(counts);

      // Daily trend
      const daily: Record<string, number> = {};
      events.forEach((e: any) => { const day = e.created_at.slice(0, 10); daily[day] = (daily[day] || 0) + 1; });
      setDailyTrend(Object.entries(daily).map(([date, count]) => ({ date: date.slice(5), count })));

      // Top products
      const productViews: Record<string, number> = {};
      events.filter((e: any) => e.event_type === "product_view" && e.resource_id)
        .forEach((e: any) => {
          const name = e.metadata?.product_name || e.resource_id;
          productViews[name] = (productViews[name] || 0) + 1;
        });
      setTopProducts(Object.entries(productViews).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, views]) => ({ name: name.slice(0, 25), views })));

      // Top pages
      const pageViews: Record<string, number> = {};
      events.filter((e: any) => e.event_type === "page_view" && e.metadata?.page)
        .forEach((e: any) => { const page = e.metadata.page; pageViews[page] = (pageViews[page] || 0) + 1; });
      setTopPages(Object.entries(pageViews).sort(([, a], [, b]) => b - a).slice(0, 8).map(([page, views]) => ({ page, views })));

      // AI queries analysis
      const queryTerms: Record<string, number> = {};
      events.filter((e: any) => e.event_type === "ai_query" && e.metadata?.query)
        .forEach((e: any) => {
          const q = (e.metadata.query as string).slice(0, 50).toLowerCase();
          queryTerms[q] = (queryTerms[q] || 0) + 1;
        });
      setAiQueries(Object.entries(queryTerms).sort(([, a], [, b]) => b - a).slice(0, 10).map(([query, count]) => ({ query, count })));

      // Feature usage (from page_view metadata)
      const features: Record<string, number> = {};
      events.filter((e: any) => e.event_type === "page_view" && e.metadata?.page)
        .forEach((e: any) => {
          const p = e.metadata.page as string;
          if (p.startsWith("/ai") || p.startsWith("/chat")) features["AI Chat"] = (features["AI Chat"] || 0) + 1;
          else if (p.startsWith("/store")) features["Store"] = (features["Store"] || 0) + 1;
          else if (p.startsWith("/media") || p.startsWith("/news")) features["Media"] = (features["Media"] || 0) + 1;
          else if (p.startsWith("/centre")) features["Centre"] = (features["Centre"] || 0) + 1;
          else if (p.startsWith("/insight")) features["Insights"] = (features["Insights"] || 0) + 1;
        });
      setFeatureUsage(Object.entries(features).map(([name, value]) => ({ name, value })));

    } catch (err) {
      console.error("Analytics load error:", err);
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

  const totalEvents = Object.values(eventCounts).reduce((a, b) => a + b, 0);

  const eventTypeCards = [
    { type: "page_view", label: "Page Views", icon: Eye, color: "text-primary" },
    { type: "product_view", label: "Product Views", icon: ShoppingBag, color: "text-blue-500" },
    { type: "ai_query", label: "AI Queries", icon: MessageSquare, color: "text-purple-500" },
    { type: "report_download", label: "Downloads", icon: FileDown, color: "text-green-500" },
    { type: "service_request", label: "Service Requests", icon: Wrench, color: "text-orange-500" },
    { type: "consultation_request", label: "Consultations", icon: GraduationCap, color: "text-cyan-500" },
    { type: "search", label: "Searches", icon: Search, color: "text-amber-500" },
  ];

  const pieData = eventTypeCards.filter((c) => eventCounts[c.type]).map((c) => ({ name: c.label, value: eventCounts[c.type] || 0 }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold">Platform Intelligence</h2>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Users", value: platformStats.totalUsers, icon: Users, color: "text-primary" },
          { label: "Waitlist", value: platformStats.waitlistUsers, icon: UserPlus, color: "text-blue-500" },
          { label: "Newsletter", value: platformStats.newsletterSubs, icon: Mail, color: "text-green-500" },
          { label: "Published Posts", value: platformStats.totalPosts, icon: Newspaper, color: "text-orange-500" },
          { label: "Products", value: platformStats.totalProducts, icon: ShoppingBag, color: "text-purple-500" },
          { label: "Consultations", value: platformStats.totalConsultations, icon: GraduationCap, color: "text-cyan-500" },
        ].map(c => (
          <Card key={c.label} className="border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2">
                <c.icon className={`w-4 h-4 ${c.color}`} />
                <div>
                  <p className="text-xl font-bold">{c.value}</p>
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Event Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{totalEvents}</p>
            <p className="text-[10px] text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        {eventTypeCards.map((c) => (
          <Card key={c.type} className="border-border/50">
            <CardContent className="pt-4 pb-3 text-center">
              <c.icon className={`w-5 h-5 mx-auto mb-1 ${c.color}`} />
              <p className="text-xl font-bold">{eventCounts[c.type] || 0}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No activity data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No events tracked yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Growth + Feature Usage */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="waitlist" stroke="hsl(var(--primary))" strokeWidth={2} name="Waitlist" dot={false} />
                  <Line type="monotone" dataKey="newsletter" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Newsletter" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No growth data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featureUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={featureUsage}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No feature usage data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Products + Pages */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" /> Top Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No product views yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-2">
                {topPages.map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] w-5 h-5 flex items-center justify-center p-0">{i + 1}</Badge>
                      <span className="text-muted-foreground truncate max-w-[200px]">{p.page}</span>
                    </div>
                    <span className="font-medium">{p.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No page view data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Usage */}
      {aiQueries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Top AI Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiQueries.map((q, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[400px]">{q.query}</span>
                  <Badge variant="secondary">{q.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
