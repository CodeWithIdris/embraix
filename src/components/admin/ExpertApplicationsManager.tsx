import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Clock, GraduationCap, FileText, Download, ExternalLink } from "lucide-react";
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
  experience_years: number | null;
  bio: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

interface ExpertDocument {
  id: string;
  file_url: string;
  file_type: string | null;
  file_name: string;
  file_size: number | null;
}

export const ExpertApplicationsManager = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ExpertApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ExpertApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [documents, setDocuments] = useState<ExpertDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

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

  const loadDocuments = async (applicationId: string) => {
    setLoadingDocs(true);
    const { data } = await supabase
      .from("expert_documents" as any)
      .select("*")
      .eq("application_id", applicationId);
    setDocuments((data || []) as any);
    setLoadingDocs(false);
  };

  const openReview = (app: ExpertApplication) => {
    setSelectedApp(app);
    setAdminNotes("");
    loadDocuments(app.id);
  };

  const handleAction = async (app: ExpertApplication, action: "approved" | "rejected") => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("expert_applications")
        .update({
          status: action,
          admin_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", app.id);

      if (error) throw error;

      if (action === "approved") {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: app.user_id, role: "expert" as any });
        if (roleError && roleError.code !== "23505") {
          console.error("Failed to add expert role:", roleError);
        }
      }

      // In-app notification to the applicant
      await supabase.from("notifications").insert({
        user_id: app.user_id,
        type: "expert_status",
        title: action === "approved" ? "Expert Application Approved!" : "Expert Application Update",
        message: action === "approved"
          ? "Congratulations! Your expert application has been approved. You can now access the Expert Panel."
          : `Your expert application was not approved.${adminNotes.trim() ? ` Reason: ${adminNotes.trim()}` : ""}`,
        reference_id: app.id,
        reference_type: "expert_application",
      });

      // Email notification
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

  const pendingApps = applications.filter(a => a.status === "pending");
  const approvedApps = applications.filter(a => a.status === "approved");
  const rejectedApps = applications.filter(a => a.status === "rejected");

  const renderAppCard = (app: ExpertApplication, showActions: boolean) => (
    <Card key={app.id} className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base font-medium">{app.full_name}</CardTitle>
              {getStatusBadge(app.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {app.email} · Applied {format(new Date(app.created_at), "MMM d, yyyy")}
              {app.experience_years && ` · ${app.experience_years}+ yrs exp.`}
            </p>
          </div>
          {showActions && (
            <Button size="sm" variant="hero" onClick={() => openReview(app)}>
              Review
            </Button>
          )}
          {!showActions && app.status !== "pending" && (
            <Button size="sm" variant="outline" onClick={() => openReview(app)}>
              View
            </Button>
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
  );

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {pendingApps.length > 0 && <Badge variant="destructive" className="ml-1">{pendingApps.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingApps.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">{pendingApps.map(a => renderAppCard(a, true))}</div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedApps.length === 0 ? (
            <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">No approved experts yet</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">{approvedApps.map(a => renderAppCard(a, false))}</div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedApps.length === 0 ? (
            <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">No rejected applications</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">{rejectedApps.map(a => renderAppCard(a, false))}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedApp.full_name}</p>
                <p><span className="font-medium">Email:</span> {selectedApp.email}</p>
                {selectedApp.phone && <p><span className="font-medium">Phone:</span> {selectedApp.phone}</p>}
                {selectedApp.experience_years && <p><span className="font-medium">Experience:</span> {selectedApp.experience_years}+ years</p>}
                <p><span className="font-medium">Expertise:</span> {selectedApp.expertise_areas?.join(", ")}</p>
                {selectedApp.linkedin && (
                  <p>
                    <span className="font-medium">LinkedIn:</span>{" "}
                    <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
                {selectedApp.portfolio && (
                  <p>
                    <span className="font-medium">Portfolio:</span>{" "}
                    <a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
                <div>
                  <span className="font-medium">Experience Summary:</span>
                  <p className="text-muted-foreground mt-1">{selectedApp.experience_summary}</p>
                </div>
                {selectedApp.qualifications && (
                  <div>
                    <span className="font-medium">Qualifications:</span>
                    <p className="text-muted-foreground mt-1">{selectedApp.qualifications}</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Uploaded Documents</h4>
                {loadingDocs ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm truncate flex-1">{doc.file_name}</span>
                        {doc.file_size && (
                          <span className="text-xs text-muted-foreground">{(doc.file_size / 1024 / 1024).toFixed(1)}MB</span>
                        )}
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selectedApp.status === "pending" && (
                <>
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
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
