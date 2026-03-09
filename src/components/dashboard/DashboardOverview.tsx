import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Headphones, MessageSquare, Heart, FileDown, Loader2 } from "lucide-react";

const DashboardOverview = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const statCards = [
    { label: "Service Requests", value: stats?.serviceRequests || 0, icon: Headphones, color: "text-blue-500" },
    { label: "Consultations", value: stats?.consultations || 0, icon: MessageSquare, color: "text-emerald-500" },
    { label: "Saved Products", value: stats?.savedProducts || 0, icon: Heart, color: "text-rose-500" },
    { label: "Reports Downloaded", value: stats?.downloads || 0, icon: FileDown, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Welcome back, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your activity overview</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="gradient-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
