import { useState } from "react";
import { PUBLIC_EXPERT_FIELDS } from "@/hooks/useExperts";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Users,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Award,
  Briefcase,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const expertiseOptions = [
  { value: "all", label: "All Expertise" },
  { value: "solar", label: "Solar Energy & Installation" },
  { value: "ev", label: "Electric Vehicles & Charging" },
  { value: "smart-home", label: "Smart Home Technologies" },
  { value: "battery", label: "Battery Storage Solutions" },
  { value: "energy-audit", label: "Energy Audits & Efficiency" },
  { value: "commercial", label: "Commercial Projects" },
  { value: "mini-grid", label: "Mini-Grid Systems" },
  { value: "policy", label: "Energy Policy" },
  { value: "research", label: "Energy Research" },
  { value: "cooking", label: "Clean Cooking Solutions" },
];

const experienceOptions = [
  { value: "all", label: "Any Experience" },
  { value: "1", label: "1-2 years" },
  { value: "3", label: "3-5 years" },
  { value: "6", label: "6-10 years" },
  { value: "11", label: "10+ years" },
];

interface ExpertProfile {
  id: string;
  user_id: string;
  full_name: string;
  professional_title: string | null;
  expertise_areas: string[];
  experience_years: number | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  badges: string[] | null;
  rating: number;
  review_count: number;
  consultation_count: number;
  is_available: boolean;
}

const ExpertMarketplace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");

  const { data: experts, isLoading } = useQuery({
    queryKey: ["experts", expertiseFilter, experienceFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("expert_profiles")
        .select(PUBLIC_EXPERT_FIELDS)
        .eq("status", "active")
        .eq("is_available", true)
        .order("rating", { ascending: false });

      if (experienceFilter !== "all") {
        const minYears = parseInt(experienceFilter);
        query = query.gte("experience_years", minYears);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data as ExpertProfile[];

      // Client-side filtering for expertise and search
      if (expertiseFilter !== "all") {
        filtered = filtered.filter(e =>
          e.expertise_areas?.some(area =>
            area.toLowerCase().includes(expertiseFilter.toLowerCase())
          )
        );
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          e =>
            e.full_name.toLowerCase().includes(q) ||
            e.bio?.toLowerCase().includes(q) ||
            e.professional_title?.toLowerCase().includes(q) ||
            e.expertise_areas?.some(area => area.toLowerCase().includes(q))
        );
      }

      return filtered;
    },
  });

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "verified":
        return <CheckCircle2 className="w-3 h-3" />;
      case "certified":
        return <Award className="w-3 h-3" />;
      case "researcher":
        return <GraduationCap className="w-3 h-3" />;
      default:
        return <Award className="w-3 h-3" />;
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case "verified":
        return "Verified Expert";
      case "certified":
        return "Certified Installer";
      case "researcher":
        return "Energy Researcher";
      default:
        return badge;
    }
  };

  return (
    <>
      <Helmet>
        <title>Expert Marketplace - Embraix Centre</title>
        <meta
          name="description"
          content="Discover and consult with certified clean energy professionals on Embraix."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Expert Marketplace
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the latest activity, insights, products, and innovations across Embraix.
              Connect with certified clean energy professionals for expert guidance.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border/50 rounded-xl p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search experts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setExpertiseFilter("all");
                  setExperienceFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Expert Cards */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !experts || experts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Experts Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || expertiseFilter !== "all" || experienceFilter !== "all"
                    ? "Try adjusting your filters to find more experts."
                    : "Be the first to join our expert network!"}
                </p>
                <Button variant="hero" onClick={() => navigate("/expert/apply")}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Apply to Become an Expert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <Card
                  key={expert.id}
                  className="gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/experts/${expert.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src={expert.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {expert.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {expert.full_name}
                        </h3>
                        {expert.professional_title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {expert.professional_title}
                          </p>
                        )}
                        {(expert.city || expert.country) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {[expert.city, expert.country].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    {expert.badges && expert.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {expert.badges.map((badge) => (
                          <Badge
                            key={badge}
                            variant="secondary"
                            className="text-xs gap-1 bg-primary/10 text-primary border-primary/20"
                          >
                            {getBadgeIcon(badge)}
                            {getBadgeLabel(badge)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Expertise Areas */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {expert.expertise_areas?.slice(0, 3).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs capitalize">
                          {area.replace("-", " ")}
                        </Badge>
                      ))}
                      {expert.expertise_areas?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{expert.expertise_areas.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Bio */}
                    {expert.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {expert.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-4">
                      {expert.experience_years && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {expert.experience_years}+ yrs
                        </span>
                      )}
                      {expert.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {expert.rating.toFixed(1)}
                        </span>
                      )}
                      {expert.consultation_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {expert.consultation_count} consultations
                        </span>
                      )}
                    </div>

                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/experts/${expert.id}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center bg-gradient-to-br from-primary/10 to-secondary/30 rounded-2xl p-8 md:p-12 border border-primary/20">
            <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">
              Are You a Clean Energy Expert?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Join our network of certified professionals and help shape Africa's clean energy future. Share your expertise and connect with clients seeking guidance.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/expert/apply")}>
              Apply to Become an Expert
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ExpertMarketplace;
