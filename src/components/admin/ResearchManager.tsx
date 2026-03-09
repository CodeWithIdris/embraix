import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllResearch, ResearchSubmission } from "@/hooks/useResearch";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, X, Eye, Loader2, FileText, Clock, User, Building, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const ResearchManager = () => {
  const { data: research, isLoading } = useAllResearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ResearchSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (id: string) => {
    setProcessing(true);
    const { error } = await supabase
      .from("research_submissions")
      .update({ status: "approved", published_at: new Date().toISOString() })
      .eq("id", id);
    setProcessing(false);
    if (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    } else {
      toast({ title: "Approved", description: "Research has been published." });
      queryClient.invalidateQueries({ queryKey: ["all-research"] });
      setSelectedItem(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(true);
    const { error } = await supabase
      .from("research_submissions")
      .update({ status: "rejected", rejection_reason: rejectReason || null })
      .eq("id", id);
    setProcessing(false);
    if (error) {
      toast({ title: "Error", description: "Failed to reject", variant: "destructive" });
    } else {
      toast({ title: "Rejected", description: "Submission has been rejected." });
      queryClient.invalidateQueries({ queryKey: ["all-research"] });
      setSelectedItem(null);
      setShowReject(false);
      setRejectReason("");
    }
  };

  const pendingCount = research?.filter((r) => r.status === "pending").length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Research Submissions</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive">{pendingCount} pending</Badge>
        )}
      </div>

      {!research?.length ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No research submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {research.map((r) => (
            <Card key={r.id} className="gradient-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={statusColors[r.status] || ""}>
                        {r.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{r.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.author_name} {r.institution ? `· ${r.institution}` : ""} · {format(new Date(r.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedItem(r)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {r.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600"
                          onClick={() => handleApprove(r.id)}
                          disabled={processing}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => { setSelectedItem(r); setShowReject(true); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem && !showReject} onOpenChange={(o) => { if (!o) setSelectedItem(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={statusColors[selectedItem.status] || ""}>{selectedItem.status}</Badge>
                <Badge variant="secondary">{selectedItem.category}</Badge>
              </div>
              <div className="flex gap-4 text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedItem.author_name}</span>
                {selectedItem.institution && <span className="flex items-center gap-1"><Building className="w-3 h-3" />{selectedItem.institution}</span>}
              </div>
              <p className="text-xs text-muted-foreground">Email: {selectedItem.email}</p>
              <div>
                <p className="font-medium mb-1">Abstract</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedItem.abstract}</p>
              </div>
              {selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedItem.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              )}
              {selectedItem.file_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> View Document
                  </a>
                </Button>
              )}
              {selectedItem.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="hero" size="sm" onClick={() => handleApprove(selectedItem.id)} disabled={processing}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve & Publish
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowReject(true)}>
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={(o) => { if (!o) { setShowReject(false); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rejecting: <span className="font-medium text-foreground">{selectedItem?.title}</span>
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowReject(false); setRejectReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => selectedItem && handleReject(selectedItem.id)} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchManager;
