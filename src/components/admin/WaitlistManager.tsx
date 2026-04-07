import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Mail, Download, TrendingUp, Calendar, Filter, Send, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WaitlistUser {
  id: string;
  name: string;
  email: string;
  country: string | null;
  preferences: string[];
  referral_code: string;
  status: string;
  created_at: string;
}

const preferenceLabels: Record<string, string> = {
  ai_insights: "AI Insights",
  clean_energy_news: "Clean Energy News",
  expert_consultation: "Expert Consultation",
  industry_reports: "Industry Reports",
  promotions: "Promotions & Deals",
  diy_guides: "DIY Guides",
  energy_tech: "Energy Technology",
};

const WaitlistManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPref, setFilterPref] = useState("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [emailTarget, setEmailTarget] = useState<"all" | "filtered">("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("waitlist_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.country || "").toLowerCase().includes(q)
      );
    }
    if (filterPref !== "all") {
      result = result.filter((u) => u.preferences?.includes(filterPref));
    }
    return result;
  }, [users, search, filterPref]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return users.filter((u) => new Date(u.created_at).toDateString() === today).length;
  }, [users]);

  const weekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return users.filter((u) => new Date(u.created_at) >= weekAgo).length;
  }, [users]);

  const exportCSV = () => {
    const rows = [["Name", "Email", "Country", "Preferences", "Referral Code", "Status", "Joined"]];
    filtered.forEach((u) => {
      rows.push([
        u.name,
        u.email,
        u.country || "",
        (u.preferences || []).map((p) => preferenceLabels[p] || p).join("; "),
        u.referral_code || "",
        u.status,
        format(new Date(u.created_at), "yyyy-MM-dd"),
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `embraix-waitlist-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported CSV" });
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) return;
    setSending(true);
    try {
      const targets = emailTarget === "all" ? users : filtered;
      const emails = targets.map((u) => u.email);

      await supabase.functions.invoke("send-waitlist-broadcast", {
        body: { emails, subject: emailSubject, message: emailMessage },
      });

      toast({ title: `Email sent to ${emails.length} users` });
      setEmailDialogOpen(false);
      setEmailSubject("");
      setEmailMessage("");
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Waitlist</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-foreground">{todayCount}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-foreground">{weekCount}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, country..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterPref} onValueChange={setFilterPref}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Preferences</SelectItem>
            {Object.entries(preferenceLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
        <Button variant="hero" size="sm" onClick={() => setEmailDialogOpen(true)}>
          <Mail className="w-4 h-4 mr-2" />Send Email
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent><Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No waitlist users found</p></CardContent>
        </Card>
      ) : (
        <Card className="gradient-card border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Preferences</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">{u.country || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(u.preferences || []).slice(0, 3).map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">{preferenceLabels[p] || p}</Badge>
                      ))}
                      {(u.preferences || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">+{u.preferences.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={async () => {
                      if (confirm(`Delete ${u.name} from waitlist?`)) {
                        const { error } = await (supabase as any).from("waitlist_users").delete().eq("id", u.id);
                        if (!error) {
                          setUsers(prev => prev.filter(wu => wu.id !== u.id));
                          toast({ title: "User removed from waitlist" });
                        }
                      }
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Send Email to Waitlist</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <Button
                variant={emailTarget === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailTarget("all")}
              >
                All Users ({users.length})
              </Button>
              <Button
                variant={emailTarget === "filtered" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailTarget("filtered")}
              >
                Filtered ({filtered.length})
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Email subject..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Write your message..." className="mt-1" rows={6} />
            </div>
            <Button variant="hero" className="w-full" onClick={handleSendEmail} disabled={sending || !emailSubject.trim() || !emailMessage.trim()}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Send to {emailTarget === "all" ? users.length : filtered.length} users
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitlistManager;
