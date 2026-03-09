import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const InstallerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch installer profile
  const { data: installer, isLoading: installerLoading, refetch: refetchInstaller } = useQuery({
    queryKey: ["my-installer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("installers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      return data as any;
    },
    enabled: !!user,
  });

  // Fetch assigned service requests
  const { data: assignedRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["installer-requests", installer?.id],
    queryFn: async () => {
      if (!installer?.id) return [];
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("assigned_installer_id", installer.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!installer?.id,
  });

  const updateAvailability = async (status: string) => {
    if (!installer) return;
    const { error } = await supabase
      .from("installers")
      .update({ availability_status: status } as any)
      .eq("id", installer.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      refetchInstaller();
    }
  };

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || installerLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!installer) {
    return (
      <>
        <Helmet><title>Installer Dashboard - Embraix</title></Helmet>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <Wrench className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold mb-2">Not Registered</h1>
            <p className="text-muted-foreground mb-4">You haven't joined the Embraix Installer Network yet.</p>
            <Button variant="hero" onClick={() => navigate("/centre/installer-register")}>
              Apply Now
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (installer.status === "pending") {
    return (
      <>
        <Helmet><title>Application Pending - Embraix Installer Network</title></Helmet>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold mb-2">Application Under Review</h1>
            <p className="text-muted-foreground mb-4">Your installer application is being reviewed by the Embraix team. We'll notify you once it's approved.</p>
            <Button variant="outline" onClick={() => navigate("/centre")}>Back to Centre</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "assigned": return <Badge className="bg-primary/20 text-primary"><Zap className="w-3 h-3 mr-1" />Assigned to You</Badge>;
      case "completed": return <Badge className="bg-green-500/20 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet><title>Installer Dashboard - Embraix</title></Helmet>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/centre")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold">Installer Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {installer.full_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={installer.availability_status} onValueChange={updateAvailability}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">🟢 Available</SelectItem>
                  <SelectItem value="busy">🟡 Busy</SelectItem>
                  <SelectItem value="offline">⚫ Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{installer.assigned_count || 0}</p>
                <p className="text-xs text-muted-foreground">Total Assignments</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{assignedRequests?.filter((r: any) => r.status === "assigned").length || 0}</p>
                <p className="text-xs text-muted-foreground">Active Requests</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{assignedRequests?.filter((r: any) => r.status === "completed").length || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Requests */}
          <h2 className="font-display text-lg font-semibold mb-4">Assigned Service Requests</h2>
          {requestsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : !assignedRequests || assignedRequests.length === 0 ? (
            <Card className="text-center py-12 border-border/50">
              <CardContent>
                <Wrench className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No assigned requests yet. Set yourself to "Available" to receive new assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignedRequests.map((req: any) => (
                <Card key={req.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium capitalize">{req.service_type?.replace(/-/g, " ")}</h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{req.user_name}</span>
                          {req.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.location}</span>}
                          <span>{format(new Date(req.created_at), "MMM d, yyyy")}</span>
                        </div>
                        {req.phone && <p className="text-xs text-muted-foreground mt-1">📞 {req.phone}</p>}
                        <p className="text-xs text-muted-foreground">📧 {req.user_email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstallerDashboard;
