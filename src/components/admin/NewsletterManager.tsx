import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  source: string | null;
  subscribed_at: string;
}

const NewsletterManager = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const useToastHook = () => {
    const { toast: t } = require("@/hooks/use-toast");
    return t;
  };

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (data) setSubs(data);
    setLoading(false);
  };

  const activeCount = subs.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{subs.length}</p>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : subs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent><Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No subscribers yet</p></CardContent>
        </Card>
      ) : (
        <Card className="gradient-card border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{s.source || "direct"}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "default" : "outline"} className="text-xs">
                      {s.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(s.subscribed_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default NewsletterManager;
