import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublishedResearch, RESEARCH_CATEGORIES } from "@/hooks/useResearch";
import { FileText, Download, Search, User, Building, Calendar, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";

const ResearchPublications = () => {
  const navigate = useNavigate();
  const { data: research, isLoading } = usePublishedResearch();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = research?.filter((r) => {
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author_name.toLowerCase().includes(search.toLowerCase()) ||
      r.abstract.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Research Publications | Embraix Insight</title>
        <meta name="description" content="Browse published clean energy research, whitepapers, and analysis from the Embraix community." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Research <span className="text-primary">Publications</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Community-contributed research, analysis, and insights in clean energy.
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate("/insight/submit-research")}>
              <Plus className="w-4 h-4 mr-2" /> Submit Research
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search research..."
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {RESEARCH_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !filtered?.length ? (
            <Card className="gradient-card border-border/50">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg mb-1">No research found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {search || categoryFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Be the first to share your research with the community."}
                </p>
                <Button variant="hero" onClick={() => navigate("/insight/submit-research")}>
                  Submit Research
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((r) => (
                <Card key={r.id} className="gradient-card border-border/50 hover:shadow-elevated transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-xs">{r.category}</Badge>
                      {r.published_at && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(r.published_at), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-semibold text-base leading-tight">{r.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {r.author_name}
                      </span>
                      {r.institution && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" /> {r.institution}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{r.abstract}</p>

                    {r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs font-normal">{t}</Badge>
                        ))}
                      </div>
                    )}

                    {r.file_url && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          {r.file_name ? `Download ${r.file_name}` : "Download Document"}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default ResearchPublications;
