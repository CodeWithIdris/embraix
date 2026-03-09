import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Wrench,
  Zap,
  Sun,
  Battery,
  Car,
  Flame,
  ClipboardCheck,
  Building,
  Send,
  Loader2,
  Upload,
  X,
  FileText,
  CheckCircle2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const SERVICE_TYPES = [
  { value: "solar-installation", label: "Solar System Installation", icon: Sun },
  { value: "battery-storage", label: "Battery Storage Setup", icon: Battery },
  { value: "ev-charger", label: "EV Charger Installation", icon: Car },
  { value: "clean-cooking", label: "Clean Cooking Solutions", icon: Flame },
  { value: "energy-audit", label: "Energy Audit", icon: ClipboardCheck },
  { value: "solar-maintenance", label: "Solar Maintenance", icon: Wrench },
  { value: "mini-grid", label: "Mini-Grid Consultation", icon: Zap },
  { value: "commercial", label: "Commercial Energy Project", icon: Building },
  { value: "other", label: "Other", icon: HelpCircle },
];

const PROJECT_SIZES = [
  { value: "small-home", label: "Small Home" },
  { value: "medium-business", label: "Medium Business" },
  { value: "large-facility", label: "Large Facility" },
];

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadedFile {
  file: File;
  uploading: boolean;
  url?: string;
}

const SupportServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    serviceType: "",
    projectSize: "",
    description: "",
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData((prev) => ({
              ...prev,
              name: data.full_name || "",
              email: data.email || user.email || "",
            }));
          }
        });
    }
  }, [user]);

  // Fetch user's past requests
  const { data: myRequests } = useQuery({
    queryKey: ["my-service-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    for (const file of selected) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({ title: "Invalid file", description: `"${file.name}" is not supported. Use PDF, JPG, or PNG.`, variant: "destructive" });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: "File too large", description: `"${file.name}" exceeds 10MB limit.`, variant: "destructive" });
        return;
      }
    }
    setFiles((prev) => [...prev, ...selected.map((f) => ({ file: f, uploading: false }))]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const { file } of files) {
      const path = `${user?.id || "anonymous"}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("service-request-files").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("service-request-files").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.serviceType || !formData.description.trim()) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      let attachmentUrls: string[] = [];
      if (files.length > 0) {
        attachmentUrls = await uploadFiles();
      }

      const { error } = await supabase.from("service_requests").insert({
        user_id: user?.id || null,
        user_name: formData.name.trim(),
        user_email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        location: formData.location.trim() || null,
        service_type: formData.serviceType,
        project_size: formData.projectSize || null,
        description: formData.description.trim(),
        attachments: attachmentUrls,
      } as any);

      if (error) throw error;

      // Auto-assign installer
      try {
        // Get the just-inserted request ID
        const { data: latestReq } = await supabase
          .from("service_requests")
          .select("id")
          .eq("user_email", formData.email.trim())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (latestReq?.id) {
          await supabase.rpc("auto_assign_installer", { p_request_id: latestReq.id });
        }
      } catch (assignErr) {
        console.log("Auto-assignment attempted:", assignErr);
      }

      // Notify admins
      if (user) {
        const { data: admins } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin" as any);

        if (admins) {
          for (const admin of admins) {
            await supabase.from("notifications").insert({
              user_id: admin.user_id,
              type: "service_request",
              title: "New Service Request",
              message: `${formData.name} submitted a ${formData.serviceType.replace("-", " ")} request.`,
              reference_type: "service_request",
            });
          }
        }
      }

      setSubmitted(true);
      setShowForm(false);
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({ title: "Error", description: "Failed to submit request. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "under_review":
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><ClipboardCheck className="w-3 h-3 mr-1" />Under Review</Badge>;
      case "assigned":
        return <Badge className="bg-primary/20 text-primary"><CheckCircle2 className="w-3 h-3 mr-1" />Assigned</Badge>;
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Support Services - Embraix Centre</title>
        <meta name="description" content="Request clean energy services — solar installation, energy audits, EV charging, and more through Embraix." />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/centre")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Service Request Hub
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Request real-world clean energy services and connect with certified professionals. From solar installation to energy audits — we've got you covered.
            </p>
            <Button variant="hero" size="lg" onClick={() => setShowForm(true)}>
              <Send className="w-4 h-4 mr-2" />
              Request a Service
            </Button>
          </div>

          {/* Success Message */}
          {submitted && (
            <Card className="border-green-500/30 bg-green-500/5 mb-8">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">Request Received!</h3>
                <p className="text-muted-foreground">
                  Your request has been received. An Embraix expert will contact you shortly.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Available Services */}
          <div className="mb-12">
            <h2 className="font-display text-xl font-semibold mb-6 text-center">Available Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICE_TYPES.filter(s => s.value !== "other").map((service) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.value}
                    className="gradient-card border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, serviceType: service.value }));
                      setShowForm(true);
                    }}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {service.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">Click to request</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* My Requests */}
          {user && myRequests && myRequests.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Your Requests</h2>
              <div className="space-y-3">
                {myRequests.map((req: any) => (
                  <Card key={req.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm capitalize">
                            {req.service_type?.replace(/-/g, " ")}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(req.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingAIConsult />

      {/* Service Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Request a Service
            </DialogTitle>
            <DialogDescription>
              Fill out the form below and our team will match you with the right expert.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234..."
                />
              </div>
              <div className="space-y-2">
                <Label>Country / City</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lagos, Nigeria"
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Project Size */}
            <div className="space-y-2">
              <Label>Project Size (optional)</Label>
              <Select value={formData.projectSize} onValueChange={(v) => setFormData({ ...formData, projectSize: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Project Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your energy needs — e.g., I want to install a solar system for my home..."
                rows={4}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Supporting Files (optional)</Label>
              <p className="text-xs text-muted-foreground">Energy bills, site photos, project documents (PDF, JPG, PNG — max 10MB)</p>
              <div className="border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/40 transition-colors">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="service-file-upload"
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("service-file-upload")?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm truncate flex-1">{f.file.name}</span>
                      <span className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(1)}MB</span>
                      <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button variant="hero" className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportServices;
