import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedCaseStudies, getStoryTypeLabel } from "@/hooks/useCaseStudies";
import {
  BookOpen, MapPin, ArrowRight, Calendar, Filter, Users, Zap, Heart, Building2,
} from "lucide-react";
import { format } from "date-fns";

const storyTypes = [
  { value: "all", label: "All Stories", icon: BookOpen },
  { value: "case_study", label: "Case Studies", icon: Building2 },
  { value: "energy_project", label: "Energy Projects", icon: Zap },
  { value: "community_story", label: "Community Stories", icon: Users },
  { value: "impact_story", label: "Impact Stories", icon: Heart },
];

const StoriesVoices = () => {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState("all");
  const { data: stories, isLoading } = usePublishedCaseStudies(activeType);

  return (
    <>
      <Helmet>
        <title>Stories & Voices | Embraix Media</title>
        <meta name="description" content="Real-world case studies, community voices, and energy transformation stories from across Africa." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <BookOpen className="w-3 h-3" />
              Stories & Voices
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Real Stories of Energy Transformation
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover how communities, businesses, and innovators are driving
              clean energy adoption across Africa through real-world projects and impact stories.
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {storyTypes.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.value}
                  variant={activeType === t.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveType(t.value)}
                  className="gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </Button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !stories?.length ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No stories published yet in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg border-border/50 hover:border-primary/30 transition-all duration-300"
                  onClick={() => navigate(`/media/stories/${story.slug}`)}
                >
                  {story.featured_image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={story.featured_image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-secondary flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {getStoryTypeLabel(story.story_type)}
                      </Badge>
                      {story.category && (
                        <Badge variant="outline" className="text-[10px]">{story.category}</Badge>
                      )}
                    </div>

                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {story.title}
                    </h3>

                    {story.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {story.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {story.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location}
                        </span>
                      )}
                      {story.project_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(story.project_date), "MMM yyyy")}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center text-sm text-primary font-medium gap-1 group-hover:gap-2 transition-all">
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </div>
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

export default StoriesVoices;
