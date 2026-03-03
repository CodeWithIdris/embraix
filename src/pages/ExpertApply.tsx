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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  GraduationCap, Send, Loader2, CheckCircle2, Clock, XCircle, Upload, FileText, X, AlertCircle,
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

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadedFile {
  file: File;
  preview?: string;
}

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
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");

  // File uploads
  const [certFiles, setCertFiles] = useState<UploadedFile[]>([]);
  const [supportFiles, setSupportFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported file type. Please upload PDF, JPG, PNG, DOC, or DOCX.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds the 10MB size limit.`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "cert" | "support") => {
    const files = Array.from(e.target.files || []);
    const setter = type === "cert" ? setCertFiles : setSupportFiles;
    const current = type === "cert" ? certFiles : supportFiles;

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast({ title: "Invalid file", description: error, variant: "destructive" });
        return;
      }
    }

    const newFiles = files.map(f => ({ file: f }));
    setter([...current, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number, type: "cert" | "support") => {
    const setter = type === "cert" ? setCertFiles : setSupportFiles;
    const current = type === "cert" ? certFiles : supportFiles;
    setter(current.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: UploadedFile[], applicationId: string): Promise<void> => {
    for (const { file } of files) {
      const filePath = `${user!.id}/${applicationId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("expert-documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      const { data: urlData } = supabase.storage
        .from("expert-documents")
        .getPublicUrl(filePath);

      await supabase.from("expert_documents" as any).insert({
        application_id: applicationId,
        user_id: user!.id,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_name: file.name,
        file_size: file.size,
      });
    }
  };

  const handleSubmit = async () => {
    if (!user || !fullName.trim() || !email.trim() || !experience.trim() || selectedAreas.length === 0) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (certFiles.length === 0) {
      toast({ title: "Certification required", description: "Please upload at least one certification document", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data: appData, error } = await supabase.from("expert_applications").insert({
        user_id: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        expertise_areas: selectedAreas,
        experience_summary: experience.trim(),
        qualifications: qualifications.trim() || null,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        bio: bio.trim() || null,
        linkedin: linkedin.trim() || null,
        portfolio: portfolio.trim() || null,
      } as any).select().single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already applied", description: "You have already submitted an application", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Failed to submit application", variant: "destructive" });
        }
        setSubmitting(false);
        return;
      }

      // Upload files
      setUploadingFiles(true);
      const allFiles = [...certFiles, ...supportFiles];
      await uploadFiles(allFiles, (appData as any).id);
      setUploadingFiles(false);

      // Create notification for admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin" as any);

      if (admins) {
        for (const admin of admins) {
          await supabase.from("notifications").insert({
            user_id: admin.user_id,
            type: "expert_application",
            title: "New Expert Application",
            message: `${fullName} has applied to become an expert.`,
            reference_id: (appData as any).id,
            reference_type: "expert_application",
          });
        }
      }

      toast({ title: "Application submitted!", description: "We'll review your application shortly." });
      const { data: refreshed } = await supabase.from("expert_applications").select("*").eq("user_id", user.id).single();
      setExisting(refreshed);
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({ title: "Error", description: err?.message || "Failed to submit application", variant: "destructive" });
    } finally {
      setSubmitting(false);
      setUploadingFiles(false);
    }
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
        return { icon: <Clock className="w-6 h-6" />, text: "Under Review", color: "text-amber-500", desc: "Your application is being reviewed by our team. We'll notify you once a decision is made." };
      case "approved":
        return { icon: <CheckCircle2 className="w-6 h-6" />, text: "Approved", color: "text-green-500", desc: "Congratulations! You've been approved as an expert. You can now access the Expert Panel." };
      case "rejected":
        return { icon: <XCircle className="w-6 h-6" />, text: "Not Approved", color: "text-destructive", desc: "Unfortunately, your application was not approved at this time." };
      default:
        return { icon: <Clock className="w-6 h-6" />, text: status, color: "text-muted-foreground", desc: "" };
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
                {existing.status === "pending" && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm">Your expert application is under review. You'll receive a notification once it's been processed.</p>
                  </div>
                )}
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
                {/* Basic Info */}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Select value={experienceYears} onValueChange={setExperienceYears}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1-2 years</SelectItem>
                        <SelectItem value="3">3-5 years</SelectItem>
                        <SelectItem value="6">6-10 years</SelectItem>
                        <SelectItem value="11">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Expertise Areas */}
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

                {/* Bio */}
                <div className="space-y-2">
                  <Label>Short Bio *</Label>
                  <Textarea
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    placeholder="Describe your relevant experience, certifications, and years in the industry..."
                    rows={4}
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn (optional)</Label>
                    <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Portfolio / Website (optional)</Label>
                    <Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." />
                  </div>
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

                {/* Certification Upload (Required) */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1">
                    Certification Documents *
                    <span className="text-xs text-muted-foreground">(PDF, JPG, PNG, DOC — max 10MB each)</span>
                  </Label>
                  <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag & drop or click to upload</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={e => handleFileSelect(e, "cert")}
                      className="hidden"
                      id="cert-upload"
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("cert-upload")?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  {certFiles.length > 0 && (
                    <div className="space-y-2">
                      {certFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm truncate flex-1">{f.file.name}</span>
                          <span className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(1)}MB</span>
                          <button onClick={() => removeFile(i, "cert")} className="text-muted-foreground hover:text-destructive">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supporting Documents (Optional) */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-1">
                    Supporting Documents
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={e => handleFileSelect(e, "support")}
                    className="hidden"
                    id="support-upload"
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("support-upload")?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Supporting Documents
                  </Button>
                  {supportFiles.length > 0 && (
                    <div className="space-y-2">
                      {supportFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm truncate flex-1">{f.file.name}</span>
                          <span className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(1)}MB</span>
                          <button onClick={() => removeFile(i, "support")} className="text-muted-foreground hover:text-destructive">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || !fullName.trim() || !email.trim() || !experience.trim() || selectedAreas.length === 0 || certFiles.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {uploadingFiles ? "Uploading documents..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
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
