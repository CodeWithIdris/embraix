import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, Users, Filter } from "lucide-react";

const preferenceOptions = [
  { id: "ai_insights", label: "AI Insights" },
  { id: "clean_energy_news", label: "Clean Energy News" },
  { id: "expert_consultation", label: "Expert Consultation" },
  { id: "industry_reports", label: "Industry Reports" },
  { id: "promotions", label: "Promotions & Deals" },
  { id: "diy_guides", label: "DIY Guides" },
  { id: "energy_tech", label: "Energy Technology" },
];

const EmailCampaigns = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipientGroup, setRecipientGroup] = useState("all");
  const [preferenceFilter, setPreferenceFilter] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; errors: number; total: number } | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: "Missing fields", description: "Please fill in subject and content", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email-campaign", {
        body: {
          subject,
          content: `<div style="color:#374151;line-height:1.7;">${content.replace(/\n/g, "<br/>")}</div>`,
          recipientGroup,
          preferenceFilter: preferenceFilter.length > 0 ? preferenceFilter : undefined,
        },
      });

      if (error) throw error;

      if (data?.sent > 0) {
        setLastResult(data);
        toast({ title: "Campaign sent!", description: `${data.sent} emails delivered successfully` });
        setSubject("");
        setContent("");
      } else {
        toast({ title: "No recipients", description: data?.message || "No matching recipients found", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send campaign", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const togglePreference = (id: string) => {
    setPreferenceFilter((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl font-bold">Email Campaigns</h2>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your email content here..."
                className="mt-1 min-h-[200px]"
                rows={10}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !subject.trim() || !content.trim()}
              className="w-full"
              variant="hero"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" />Send Campaign</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="waitlist">Waitlist Users</SelectItem>
                  <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Interest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {preferenceOptions.map((pref) => (
                <label key={pref.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={preferenceFilter.includes(pref.id)}
                    onCheckedChange={() => togglePreference(pref.id)}
                  />
                  <span className="text-sm">{pref.label}</span>
                </label>
              ))}
              {preferenceFilter.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setPreferenceFilter([])}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {lastResult && (
            <Card className="gradient-card border-border/50">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-2">Last Campaign</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">{lastResult.sent} sent</Badge>
                  {lastResult.errors > 0 && <Badge variant="destructive">{lastResult.errors} failed</Badge>}
                  <Badge variant="secondary">{lastResult.total} total</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCampaigns;
