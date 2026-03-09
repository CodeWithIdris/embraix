import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, BarChart3, Eye, ShoppingBag, MessageSquare, FileDown,
  Wrench, GraduationCap, TrendingUp, Zap, Search,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
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
      // Get all events in range
      const { data: events } = await (supabase as any)
        .from("analytics_events")
        .select("event_type, resource_id, resource_type, metadata, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      if (!events) {
        setLoading(false);
        return;
      }

      // Count by event type
      const counts: Record<string, number> = {};
      events.forEach((e: any) => {
        counts[e.event_type] = (counts[e.event_type] || 0) + 1;
      });
      setEventCounts(counts);

      // Daily trend
      const daily: Record<string, number> = {};
      events.forEach((e: any) => {
        const day = e.created_at.slice(0, 10);
        daily[day] = (daily[day] || 0) + 1;
      });
      setDailyTrend(
        Object.entries(daily).map(([date, count]) => ({
          date: date.slice(5),
          count,
        }))
      );

      // Top products by views
      const productViews: Record<string, number> = {};
      events
        .filter((e: any) => e.event_type === "product_view" && e.resource_id)
        .forEach((e: any) => {
          const name = e.metadata?.product_name || e.resource_id;
          productViews[name] = (productViews[name] || 0) + 1;
        });
      setTopProducts(
        Object.entries(productViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, views]) => ({ name: name.slice(0, 20), views }))
      );

      // Top pages
      const pageViews: Record<string, number> = {};
      events
        .filter((e: any) => e.event_type === "page_view" && e.metadata?.page)
        .forEach((e: any) => {
          const page = e.metadata.page;
          pageViews[page] = (pageViews[page] || 0) + 1;
        });
      setTopPages(
        Object.entries(pageViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([page, views]) => ({ page, views }))
      );
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

  const pieData = eventTypeCards
    .filter((c) => eventCounts[c.type])
    .map((c) => ({ name: c.label, value: eventCounts[c.type] || 0 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h2 className="font-display text-xl font-bold">Platform Intelligence</h2>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {eventTypeCards.slice(0, 3).map((c) => (
          <Card key={c.type} className="border-border/50">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/50">
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{eventCounts[c.type] || 0}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All event type cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">No activity data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Event Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Event Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
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

      {/* Top Products & Pages */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Top Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
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
              <Eye className="w-4 h-4 text-primary" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-2">
                {topPages.map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] w-5 h-5 flex items-center justify-center p-0">
                        {i + 1}
                      </Badge>
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
    </div>
  );
};

export default AnalyticsDashboard;
