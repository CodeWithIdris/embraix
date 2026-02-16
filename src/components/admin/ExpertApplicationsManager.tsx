import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Clock, GraduationCap, User } from "lucide-react";
import { format } from "date-fns";

interface ExpertApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  expertise_areas: string[];
  experience_summary: string;
  qualifications: string | null;
  phone: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export const ExpertApplicationsManager = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ExpertApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ExpertApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("expert_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setApplications((data || []) as ExpertApplication[]);
    setLoading(false);
  };

  const handleAction = async (app: ExpertApplication, action: "approved" | "rejected") => {
    setProcessing(true);
    try {
      // Update application status
      const { error } = await supabase
        .from("expert_applications")
        .update({
          status: action,
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", app.id);

      if (error) throw error;

      // If approved, add expert role
      if (action === "approved") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: app.user_id, role: "expert" as any });

        if (roleError && roleError.code !== "23505") {
          console.error("Failed to add expert role:", roleError);
        }
      }

      // Send email notification
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: action === "approved" ? "expert_approved" : "expert_rejected",
            recipientEmail: app.email,
            recipientName: app.full_name,
            data: {
              notes: adminNotes.trim() || undefined,
              dashboardUrl: `${window.location.origin}/expert-dashboard`,
            },
          },
        });
      } catch (emailErr) {
        console.error("Failed to send notification:", emailErr);
      }

      toast({
        title: action === "approved" ? "Expert Approved" : "Application Rejected",
        description: action === "approved"
          ? `${app.full_name} has been added as an expert`
          : `Application from ${app.full_name} has been rejected`,
      });

      setSelectedApp(null);
      setAdminNotes("");
      loadApplications();
    } catch (err) {
      console.error("Error processing application:", err);
      toast({ title: "Error", description: "Failed to process application", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-500">
          <Clock className="w-4 h-4" />
          {pendingCount} pending application{pendingCount > 1 ? "s" : ""} awaiting review
        </div>
      )}

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No expert applications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <Card key={app.id} className="gradient-card border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-medium">{app.full_name}</CardTitle>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{app.email} · Applied {format(new Date(app.created_at), "MMM d, yyyy")}</p>
                  </div>
                  {app.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="hero" onClick={() => { setSelectedApp(app); setAdminNotes(""); }}>
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {app.expertise_areas?.map(area => (
                    <Badge key={area} variant="secondary" className="text-xs capitalize">{area.replace("-", " ")}</Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{app.experience_summary}</p>
                {app.admin_notes && (
                  <div className="bg-secondary/30 p-2 rounded text-sm">
                    <span className="font-medium">Notes:</span> {app.admin_notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedApp.full_name}</p>
                <p><span className="font-medium">Email:</span> {selectedApp.email}</p>
                {selectedApp.phone && <p><span className="font-medium">Phone:</span> {selectedApp.phone}</p>}
                <p><span className="font-medium">Expertise:</span> {selectedApp.expertise_areas?.join(", ")}</p>
                <div>
                  <span className="font-medium">Experience:</span>
                  <p className="text-muted-foreground mt-1">{selectedApp.experience_summary}</p>
                </div>
                {selectedApp.qualifications && (
                  <div>
                    <span className="font-medium">Qualifications:</span>
                    <p className="text-muted-foreground mt-1">{selectedApp.qualifications}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes (optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the applicant..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  onClick={() => handleAction(selectedApp, "rejected")}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                  Reject
                </Button>
                <Button
                  variant="hero"
                  onClick={() => handleAction(selectedApp, "approved")}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Approve as Expert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
