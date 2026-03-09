import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCaseStudy, getStoryTypeLabel } from "@/hooks/useCaseStudies";
import {
  ArrowLeft, MapPin, Calendar, User, Building2, AlertTriangle, Lightbulb,
  Wrench, TrendingUp, Play, FileText, ExternalLink, Tag,
} from "lucide-react";
import { format } from "date-fns";

const StoryDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { data: story, isLoading, error } = useCaseStudy(slug || "");

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !story) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Story not found.</p>
            <Button onClick={() => navigate("/media/stories")}>Back to Stories</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sections = [
    { icon: AlertTriangle, title: "The Challenge", content: story.problem, color: "text-destructive" },
    { icon: Lightbulb, title: "The Solution", content: story.solution, color: "text-primary" },
    { icon: Wrench, title: "Implementation", content: story.implementation, color: "text-muted-foreground" },
    { icon: TrendingUp, title: "Impact & Results", content: story.impact, color: "text-green-600" },
  ].filter((s) => s.content);

  return (
    <>
      <Helmet>
        <title>{story.title} | Embraix Stories</title>
        <meta name="description" content={story.excerpt || story.title} />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/media/stories")} className="mb-6 gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Stories
          </Button>

          {/* Hero Image */}
          {story.featured_image && (
            <div className="rounded-xl overflow-hidden mb-8 aspect-video">
              <img src={story.featured_image} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{getStoryTypeLabel(story.story_type)}</Badge>
            {story.category && <Badge variant="outline">{story.category}</Badge>}
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {story.title}
          </h1>

          {story.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">{story.excerpt}</p>
          )}

          {/* Author Info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
            {story.author_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {story.author_name}
              </span>
            )}
            {story.organization && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> {story.organization}
              </span>
            )}
            {story.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {story.location}
              </span>
            )}
            {story.project_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {format(new Date(story.project_date), "MMMM yyyy")}
              </span>
            )}
          </div>

          <Separator className="mb-8" />

          {/* Structured Sections */}
          <div className="space-y-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className={`w-5 h-5 ${section.color}`} />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional content */}
          {story.content && (
            <div className="mt-8">
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{story.content}</p>
            </div>
          )}

          {/* Video */}
          {story.video_url && (
            <div className="mt-8">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" /> Video
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
                <iframe
                  src={story.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Project video"
                />
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {story.images && story.images.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display font-semibold mb-3">Project Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {story.images.map((img, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden aspect-video">
                    <img src={img} alt={`Project image ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentation */}
          {story.documentation_urls && story.documentation_urls.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Project Documentation
              </h3>
              <div className="space-y-2">
                {story.documentation_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="flex-1 truncate">Document {idx + 1}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {story.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* CTA */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="font-display text-xl font-semibold mb-2">Have a Story to Share?</h3>
              <p className="text-muted-foreground mb-4">
                Share your clean energy project or community impact story with the Embraix community.
              </p>
              <Button onClick={() => navigate("/media/stories/submit")}>Submit Your Story</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default StoryDetail;
