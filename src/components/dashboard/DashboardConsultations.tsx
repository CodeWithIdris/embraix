import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConsultationRequests } from "@/hooks/useDashboard";
import { Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
};

const DashboardConsultations = () => {
  const { data: consultations, isLoading } = useConsultationRequests();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Consultation Requests</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !consultations?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No consultations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {consultations.map((c: any) => (
            <Card key={c.id} className="gradient-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      Expert: {c.expert_profiles?.full_name || "Pending assignment"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(c.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusColors[c.status] || ""}>
                    {c.status}
                  </Badge>
                </div>
                {c.expert_response && (
                  <div className="mt-3 bg-primary/5 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Response</p>
                    <p className="text-sm">{c.expert_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardConsultations;
