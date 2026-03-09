import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Clock,
  CheckCircle,
  ClipboardCheck,
  Wrench,
  FileText,
  ExternalLink,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";

interface ServiceRequest {
  id: string;
  user_name: string;
  user_email: string;
  phone: string | null;
  location: string | null;
  service_type: string;
  project_size: string | null;
  description: string;
  attachments: string[] | null;
  status: string;
  assigned_expert_id: string | null;
  admin_notes: string | null;
  created_at: string;
}

interface ExpertOption {
  id: string;
  full_name: string;
  expertise_areas: string[];
}

export const ServiceRequestsManager = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [assignExpertId, setAssignExpertId] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
    loadExperts();
  }, []);

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRequests((data || []) as ServiceRequest[]);
    setLoading(false);
  };

  const loadExperts = async () => {
    const { data } = await supabase
      .from("expert_profiles")
      .select("id, full_name, expertise_areas")
      .eq("status", "active");
    if (data) setExperts(data as ExpertOption[]);
  };

  const openReview = (req: ServiceRequest) => {
    setSelectedReq(req);
    setAdminNotes(req.admin_notes || "");
    setAssignExpertId(req.assigned_expert_id || "");
  };

  const handleUpdateStatus = async (req: ServiceRequest, newStatus: string) => {
    setProcessing(true);
    try {
      const updates: any = {
        status: newStatus,
        admin_notes: adminNotes.trim() || null,
      };

      if (assignExpertId) {
        updates.assigned_expert_id = assignExpertId;
      }

      const { error } = await supabase
        .from("service_requests")
        .update(updates)
        .eq("id", req.id);

      if (error) throw error;

      // Notify user if they have an account
      if (req.user_email) {
        // Notify via in-app notification if user_id exists
        const requestData = requests.find(r => r.id === req.id);
        if (requestData) {
          try {
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", req.user_email)
              .maybeSingle();

            if (userProfile) {
              await supabase.from("notifications").insert({
                user_id: userProfile.id,
                type: "service_request_update",
                title: "Service Request Updated",
                message: `Your ${req.service_type.replace(/-/g, " ")} request status is now: ${newStatus.replace("_", " ")}.`,
                reference_id: req.id,
                reference_type: "service_request",
              });
            }
          } catch (err) {
            console.error("Notification error:", err);
          }
        }
      }

      toast({
        title: "Request Updated",
        description: `Status changed to ${newStatus.replace("_", " ")}.`,
      });

      setSelectedReq(null);
      loadRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      toast({ title: "Error", description: "Failed to update request.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "under_review":
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><ClipboardCheck className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "assigned":
        return <Badge className="bg-primary/20 text-primary"><UserPlus className="w-3 h-3 mr-1" />Assigned</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pending = requests.filter(r => r.status === "pending");
  const inProgress = requests.filter(r => ["under_review", "assigned"].includes(r.status));
  const completed = requests.filter(r => r.status === "completed");

  const renderCard = (req: ServiceRequest) => (
    <Card key={req.id} className="gradient-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base font-medium capitalize">
                {req.service_type.replace(/-/g, " ")}
              </CardTitle>
              {getStatusBadge(req.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {req.user_name} · {req.user_email} · {format(new Date(req.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => openReview(req)}>
            Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
        {req.location && (
          <p className="text-xs text-muted-foreground mt-1">📍 {req.location}</p>
        )}
        {req.project_size && (
          <Badge variant="secondary" className="text-xs mt-2 capitalize">{req.project_size.replace("-", " ")}</Badge>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{inProgress.length}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending
            {pending.length > 0 && <Badge variant="destructive" className="ml-1">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 ? (
            <Card className="text-center py-12"><CardContent><Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No pending requests</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">{pending.map(renderCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-4">
          {inProgress.length === 0 ? (
            <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">No requests in progress</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">{inProgress.map(renderCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completed.length === 0 ? (
            <Card className="text-center py-12"><CardContent><p className="text-muted-foreground">No completed requests</p></CardContent></Card>
          ) : (
            <div className="grid gap-4">{completed.map(renderCard)}</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Service Request</DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedReq.user_name}</p>
                <p><span className="font-medium">Email:</span> {selectedReq.user_email}</p>
                {selectedReq.phone && <p><span className="font-medium">Phone:</span> {selectedReq.phone}</p>}
                {selectedReq.location && <p><span className="font-medium">Location:</span> {selectedReq.location}</p>}
                <p><span className="font-medium">Service:</span> <span className="capitalize">{selectedReq.service_type.replace(/-/g, " ")}</span></p>
                {selectedReq.project_size && <p><span className="font-medium">Size:</span> <span className="capitalize">{selectedReq.project_size.replace("-", " ")}</span></p>}
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{selectedReq.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedReq.attachments && selectedReq.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Attachments</h4>
                  <div className="space-y-1">
                    {selectedReq.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="truncate flex-1">Attachment {i + 1}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign Expert */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Expert</label>
                <Select value={assignExpertId} onValueChange={setAssignExpertId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an expert" />
                  </SelectTrigger>
                  <SelectContent>
                    {experts.map((expert) => (
                      <SelectItem key={expert.id} value={expert.id}>
                        {expert.full_name} ({expert.expertise_areas?.slice(0, 2).join(", ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this request..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedReq.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedReq, "under_review")}
                      disabled={processing}
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ClipboardCheck className="w-4 h-4 mr-1" />}
                      Mark Under Review
                    </Button>
                    <Button
                      variant="hero"
                      onClick={() => handleUpdateStatus(selectedReq, "assigned")}
                      disabled={processing || !assignExpertId}
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                      Assign & Approve
                    </Button>
                  </>
                )}
                {selectedReq.status === "under_review" && (
                  <Button
                    variant="hero"
                    onClick={() => handleUpdateStatus(selectedReq, "assigned")}
                    disabled={processing || !assignExpertId}
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                    Assign Expert
                  </Button>
                )}
                {["under_review", "assigned"].includes(selectedReq.status) && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleUpdateStatus(selectedReq, "completed")}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
