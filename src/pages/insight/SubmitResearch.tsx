import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitResearch, RESEARCH_CATEGORIES, ResearchFormData } from "@/hooks/useResearch";
import { ArrowLeft, Upload, Loader2, FileText, X, Plus } from "lucide-react";

const SubmitResearch = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const submitMutation = useSubmitResearch();

  const [formData, setFormData] = useState<ResearchFormData>({
    title: "",
    author_name: "",
    institution: "",
    email: user?.email || "",
    category: "",
    abstract: "",
    tags: [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) {
      alert("Only PDF and DOCX files are allowed.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      alert("File must be under 20MB.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author_name || !formData.email || !formData.category || !formData.abstract) return;
    await submitMutation.mutateAsync({ formData, file });
    navigate("/profile?tab=overview");
  };

  const isValid = formData.title && formData.author_name && formData.email && formData.category && formData.abstract;

  return (
    <>
      <Helmet>
        <title>Submit Research | Embraix Insight</title>
        <meta name="description" content="Submit your clean energy research, analysis, or insights for publication on Embraix." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="mb-6">
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Submit Research or <span className="text-primary">Insight</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Share your research, analysis, or insights about clean energy and sustainable technologies.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="gradient-card border-border/50">
              <CardContent className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium">Title of Research *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Impact of Mini-Grid Solutions on Rural Energy Access"
                    className="mt-1"
                    maxLength={200}
                  />
                </div>

                {/* Author & Institution */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Author Name *</label>
                    <Input
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-1"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Institution / Organization</label>
                    <Input
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Optional"
                      className="mt-1"
                      maxLength={150}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium">Email Address *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="mt-1"
                    maxLength={255}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium">Research Category *</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESEARCH_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Abstract */}
                <div>
                  <label className="text-sm font-medium">Abstract / Summary *</label>
                  <Textarea
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    placeholder="Provide a summary of your research findings..."
                    className="mt-1"
                    rows={5}
                    maxLength={3000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{formData.abstract.length}/3000</p>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1"
                      maxLength={30}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium">Upload Document (PDF or DOCX)</label>
                  <div className="mt-1">
                    {file ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFile(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/30 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload (PDF, DOCX — max 20MB)</p>
                        <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={!isValid || submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Submit for Review
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Submissions are reviewed by our team before publication.
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SubmitResearch;
