import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle2,
  Wrench,
  Shield,
  Upload,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SPECIALIZATIONS = [
  { value: "solar-installation", label: "Solar System Installation" },
  { value: "battery-storage", label: "Battery Storage Installation" },
  { value: "ev-charger", label: "EV Charger Installation" },
  { value: "mini-grid", label: "Mini-Grid Systems" },
  { value: "solar-maintenance", label: "Energy System Maintenance" },
  { value: "energy-audit", label: "Energy Audits" },
];

const InstallerRegister = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    country: "Nigeria",
    yearsExperience: "",
    certifications: "",
    bio: "",
  });

  const toggleSpec = (value: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to register as an installer.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!formData.fullName.trim() || !formData.email.trim() || selectedSpecs.length === 0) {
      toast({ title: "Missing fields", description: "Please fill name, email, and select at least one specialization.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("installers").insert({
        user_id: user.id,
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        location: `${formData.city.trim()}, ${formData.country.trim()}`,
        city: formData.city.trim() || null,
        country: formData.country.trim(),
        specializations: selectedSpecs,
        years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        certifications: formData.certifications ? formData.certifications.split(",").map((c) => c.trim()).filter(Boolean) : null,
        bio: formData.bio.trim() || null,
      } as any);

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already registered", description: "You have already applied to the installer network." });
        } else throw error;
      } else {
        setSubmitted(true);
        // Notify admins
        const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin" as any);
        if (admins) {
          for (const admin of admins) {
            await supabase.from("notifications").insert({
              user_id: admin.user_id,
              type: "installer_application",
              title: "New Installer Application",
              message: `${formData.fullName} applied to join the Embraix Installer Network.`,
              reference_type: "installer",
            });
          }
        }
      }
    } catch (err: any) {
      console.error("Installer register error:", err);
      toast({ title: "Error", description: "Failed to submit application.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet><title>Application Submitted - Embraix Installer Network</title></Helmet>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Application Received!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to the Embraix Installer Network. Our team will review your application and get back to you shortly.
            </p>
            <Button variant="outline" onClick={() => navigate("/centre")}>
              Back to Centre
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Join Embraix Installer Network</title>
        <meta name="description" content="Apply to become a certified Embraix installer. Join our managed network of clean energy professionals." />
      </Helmet>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/centre")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Join the Embraix Installer Network
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Become part of our managed network of certified clean energy professionals. Get matched with service requests automatically.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, title: "Verified Badge", desc: "Earn Embraix certification" },
              { icon: Wrench, title: "Auto-Matched", desc: "Get assigned jobs automatically" },
              { icon: CheckCircle2, title: "Grow Your Business", desc: "Access to Embraix clients" },
            ].map((b) => (
              <Card key={b.title} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <b.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <h3 className="text-sm font-medium">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Form */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+234..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input type="number" min="0" value={formData.yearsExperience} onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })} placeholder="e.g. 5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="Nigeria" />
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>Service Specializations *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <label key={spec.value} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/40 cursor-pointer transition-colors text-sm">
                        <Checkbox checked={selectedSpecs.includes(spec.value)} onCheckedChange={() => toggleSpec(spec.value)} />
                        <span className="text-foreground">{spec.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <Input value={formData.certifications} onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} placeholder="NABCEP, Solar PV Installer, etc. (comma-separated)" />
                </div>

                <div className="space-y-2">
                  <Label>Professional Bio</Label>
                  <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your experience and expertise..." rows={4} />
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Submit Application
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Applications are reviewed by the Embraix team. Only approved installers join the network.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstallerRegister;
