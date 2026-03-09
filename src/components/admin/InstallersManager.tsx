import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  CheckCircle,
  X,
  Loader2,
  Wrench,
  Clock,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";

interface Installer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  specializations: string[];
  years_experience: number | null;
  certifications: string[] | null;
  bio: string | null;
  status: string;
  availability_status: string;
  assigned_count: number;
  created_at: string;
}

export const InstallersManager = () => {
  const [installers, setInstallers] = useState<Installer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const fetchInstallers = async () => {
    setLoading(true);
    let query = supabase.from("installers").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching installers:", error);
    } else {
      setInstallers((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstallers();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("installers").update({ status } as any).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? "Installer Approved" : "Installer Rejected" });
      fetchInstallers();
    }
  };

  const updateAvailability = async (id: string, availability_status: string) => {
    const { error } = await supabase.from("installers").update({ availability_status } as any).eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to update availability.", variant: "destructive" });
    } else {
      toast({ title: "Availability Updated" });
      fetchInstallers();
    }
  };

  const pendingCount = installers.filter((i) => i.status === "pending").length;
  const approvedCount = installers.filter((i) => i.status === "approved").length;
  const availableCount = installers.filter((i) => i.status === "approved" && i.availability_status === "available").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved": return <Badge className="bg-green-500/20 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected": return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case "available": return <Badge className="bg-green-500/20 text-green-500">Available</Badge>;
      case "busy": return <Badge className="bg-amber-500/20 text-amber-500">Busy</Badge>;
      case "offline": return <Badge variant="outline">Offline</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{installers.length}</p>
            <p className="text-xs text-muted-foreground">Total Installers</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Installers</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : installers.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No installer applications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {installers.map((installer) => (
            <Card key={installer.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold">{installer.full_name}</h3>
                      {getStatusBadge(installer.status)}
                      {installer.status === "approved" && getAvailabilityBadge(installer.availability_status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{installer.email}</p>
                    {installer.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {installer.location}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {installer.specializations?.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs capitalize">
                          {s.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                    {installer.years_experience && (
                      <p className="text-xs text-muted-foreground mt-1">{installer.years_experience} years experience</p>
                    )}
                    {installer.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{installer.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied {format(new Date(installer.created_at), "MMM d, yyyy")} · {installer.assigned_count} assignments
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {installer.status === "pending" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => updateStatus(installer.id, "approved")}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(installer.id, "rejected")}>
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {installer.status === "approved" && (
                      <Select value={installer.availability_status} onValueChange={(v) => updateAvailability(installer.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
