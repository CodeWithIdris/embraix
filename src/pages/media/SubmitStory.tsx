import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Upload, ArrowLeft } from "lucide-react";

const categories = [
  "Agriculture", "Commercial", "Community", "Clean Cooking",
  "Electric Vehicles", "Energy Storage", "Mini-Grid", "Solar Energy",
  "Smart Technology", "Other",
];

const SubmitStory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    story_type: "case_study" as string,
    location: "",
    category: "",
    excerpt: "",
    problem: "",
    solution: "",
    implementation: "",
    impact: "",
    content: "",
    author_name: "",
    organization: "",
    tags: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You must be logged in to submit a story.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!form.title || !form.excerpt) {
      toast({ title: "Missing fields", description: "Title and summary are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let featured_image = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("case-study-files").upload(path, file);
        if (!uploadError) {
          const { data } = supabase.storage.from("case-study-files").getPublicUrl(path);
          featured_image = data.publicUrl;
        }
      }

      const { error } = await supabase.from("case_studies").insert({
        user_id: user.id,
        title: form.title,
        slug: `${slug}-${Date.now()}`,
        story_type: form.story_type as any,
        location: form.location || null,
        category: form.category || null,
        excerpt: form.excerpt,
        problem: form.problem || null,
        solution: form.solution || null,
        implementation: form.implementation || null,
        impact: form.impact || null,
        content: form.content || null,
        featured_image,
        author_name: form.author_name || null,
        organization: form.organization || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });

      if (error) throw error;

      toast({ title: "Story submitted!", description: "Your story has been submitted for review." });
      navigate("/media/stories");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit story.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Submit a Story | Embraix Media</title>
        <meta name="description" content="Share your clean energy project or community impact story." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/media/stories")} className="mb-6 gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Stories
          </Button>

          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <BookOpen className="w-3 h-3" /> Submit Story
            </Badge>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Share Your Story
            </h1>
            <p className="text-muted-foreground">
              Tell us about your clean energy project, community impact, or transformation story.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Story Title *</Label>
                    <Input value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g., Solar Installation for Rural School" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Story Type</Label>
                    <Select value={form.story_type} onValueChange={(v) => handleChange("story_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="case_study">Case Study</SelectItem>
                        <SelectItem value="energy_project">Energy Project</SelectItem>
                        <SelectItem value="community_story">Community Story</SelectItem>
                        <SelectItem value="impact_story">Impact Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g., Lagos, Nigeria" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author Name</Label>
                    <Input value={form.author_name} onChange={(e) => handleChange("author_name", e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization</Label>
                    <Input value={form.organization} onChange={(e) => handleChange("organization", e.target.value)} placeholder="Your organization" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Summary / Excerpt *</Label>
                  <Textarea value={form.excerpt} onChange={(e) => handleChange("excerpt", e.target.value)} placeholder="Brief overview of the story" rows={3} required />
                </div>

                <div className="space-y-2">
                  <Label>The Challenge / Problem</Label>
                  <Textarea value={form.problem} onChange={(e) => handleChange("problem", e.target.value)} placeholder="What problem was being addressed?" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>The Solution</Label>
                  <Textarea value={form.solution} onChange={(e) => handleChange("solution", e.target.value)} placeholder="What solution was implemented?" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Implementation</Label>
                  <Textarea value={form.implementation} onChange={(e) => handleChange("implementation", e.target.value)} placeholder="How was the solution carried out?" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Impact & Results</Label>
                  <Textarea value={form.impact} onChange={(e) => handleChange("impact", e.target.value)} placeholder="What was the outcome?" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input value={form.tags} onChange={(e) => handleChange("tags", e.target.value)} placeholder="solar, community, rural (comma-separated)" />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Story for Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SubmitStory;
