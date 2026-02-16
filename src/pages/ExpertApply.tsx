import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  GraduationCap, Send, Loader2, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const expertiseOptions = [
  { value: "solar", label: "Solar Energy & Installation" },
  { value: "ev", label: "Electric Vehicles & Charging" },
  { value: "smart-home", label: "Smart Home Technologies" },
  { value: "battery", label: "Battery Storage Solutions" },
  { value: "energy-audit", label: "Energy Audits & Efficiency" },
  { value: "commercial", label: "Commercial Projects" },
];

const ExpertApply = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("expert_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setExisting(data);
      
      // Pre-fill from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      if (profile) {
        setFullName(profile.full_name || "");
        setEmail(profile.email || user.email || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleArea = (value: string) => {
    setSelectedAreas(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!user || !fullName.trim() || !email.trim() || !experience.trim() || selectedAreas.length === 0) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("expert_applications").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      expertise_areas: selectedAreas,
      experience_summary: experience.trim(),
      qualifications: qualifications.trim() || null,
    });
    setSubmitting(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already applied", description: "You have already submitted an application", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to submit application", variant: "destructive" });
      }
      return;
    }

    toast({ title: "Application submitted!", description: "We'll review your application shortly." });
    // Reload to show status
    const { data } = await supabase.from("expert_applications").select("*").eq("user_id", user.id).single();
    setExisting(data);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return { icon: <Clock className="w-5 h-5" />, text: "Under Review", color: "text-amber-500", desc: "Your application is being reviewed by our team." };
      case "approved":
        return { icon: <CheckCircle2 className="w-5 h-5" />, text: "Approved", color: "text-green-500", desc: "Congratulations! You've been approved as an expert. You can now access the Expert Panel." };
      case "rejected":
        return { icon: <XCircle className="w-5 h-5" />, text: "Not Approved", color: "text-destructive", desc: "Unfortunately, your application was not approved at this time." };
      default:
        return { icon: <Clock className="w-5 h-5" />, text: status, color: "text-muted-foreground", desc: "" };
    }
  };

  return (
    <>
      <Helmet>
        <title>Become an Expert - Embraix</title>
        <meta name="description" content="Apply to become a certified expert on Embraix and help clients with energy solutions." />
      </Helmet>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          {existing ? (
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <div className={`mx-auto mb-3 ${getStatusDisplay(existing.status).color}`}>
                  {getStatusDisplay(existing.status).icon}
                </div>
                <CardTitle className="text-xl">Application {getStatusDisplay(existing.status).text}</CardTitle>
                <CardDescription>{getStatusDisplay(existing.status).desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary/30 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {existing.full_name}</p>
                  <p><span className="font-medium">Email:</span> {existing.email}</p>
                  <p><span className="font-medium">Expertise:</span> {existing.expertise_areas?.join(", ")}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(existing.created_at).toLocaleDateString()}</p>
                </div>
                {existing.admin_notes && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-primary mb-1">Admin Notes:</p>
                    <p className="text-sm">{existing.admin_notes}</p>
                  </div>
                )}
                {existing.status === "approved" && (
                  <Button variant="hero" className="w-full" onClick={() => navigate("/expert-dashboard")}>
                    Go to Expert Panel
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardHeader className="text-center">
                <GraduationCap className="w-10 h-10 text-primary mx-auto mb-2" />
                <CardTitle className="text-xl">Apply to Become an Expert</CardTitle>
                <CardDescription>
                  Share your expertise with clients seeking professional guidance on energy solutions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone (optional)</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." />
                </div>
                <div className="space-y-2">
                  <Label>Areas of Expertise *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expertiseOptions.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors">
                        <Checkbox
                          checked={selectedAreas.includes(opt.value)}
                          onCheckedChange={() => toggleArea(opt.value)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience Summary *</Label>
                  <Textarea
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="Describe your relevant experience, certifications, and years in the industry..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qualifications & Certifications (optional)</Label>
                  <Textarea
                    value={qualifications}
                    onChange={e => setQualifications(e.target.value)}
                    placeholder="List any relevant certifications, degrees, or training..."
                    rows={3}
                  />
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || !fullName.trim() || !email.trim() || !experience.trim() || selectedAreas.length === 0}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ExpertApply;
