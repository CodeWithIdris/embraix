import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServiceRequests } from "@/hooks/useDashboard";
import { Headphones, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  assigned: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const DashboardServiceRequests = () => {
  const { data: requests, isLoading } = useServiceRequests();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Service Requests</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !requests?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <Headphones className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No service requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <Dialog key={req.id}>
              <DialogTrigger asChild>
                <Card className="gradient-card border-border/50 hover:shadow-elevated transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{req.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(req.created_at!), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[req.status] || ""}>
                      {req.status}
                    </Badge>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">{req.subject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge variant="outline" className={statusColors[req.status] || ""}>{req.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Priority</p>
                    <p className="capitalize">{req.priority || "Normal"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Description</p>
                    <p className="text-foreground">{req.description}</p>
                  </div>
                  {req.expert_reply && (
                    <div className="bg-primary/5 rounded-lg p-3">
                      <p className="text-muted-foreground text-xs mb-1">Expert Reply</p>
                      <p className="text-foreground">{req.expert_reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted: {format(new Date(req.created_at!), "PPP")}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardServiceRequests;
