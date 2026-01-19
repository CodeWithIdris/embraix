import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard from "@/components/centre/ListingCard";
import ProjectCard from "@/components/centre/ProjectCard";
import MessageDialog from "@/components/centre/MessageDialog";
import { useServiceProviders } from "@/hooks/useServiceProviders";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle,
  Briefcase,
  FolderOpen,
  MessageSquare,
  Loader2
} from "lucide-react";

const ProviderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProvider, useProviderListings, useProviderProjects, useProviderReviews } = useServiceProviders();
  
  const { data: provider, isLoading: providerLoading } = useProvider(id!);
  const { data: listings } = useProviderListings(id!);
  const { data: projects } = useProviderProjects(id!);
  const { data: reviews } = useProviderReviews(id!);

  if (providerLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Provider not found</p>
              <Button variant="hero" onClick={() => navigate("/centre/browse")}>
                Browse Providers
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{provider.business_name} | Embraix Centre</title>
        <meta name="description" content={provider.description || `View ${provider.business_name} services on Embraix`} />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Profile Header */}
          <div className="relative mb-8">
            <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10">
              {provider.cover_image && (
                <img
                  src={provider.cover_image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-16 relative">
              <Card className="gradient-card border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-xl border-4 border-background bg-muted overflow-hidden shadow-card">
                        {provider.logo_url ? (
                          <img
                            src={provider.logo_url}
                            alt={provider.business_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                            {provider.business_name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="font-display text-2xl font-bold">
                              {provider.business_name}
                            </h1>
                            {provider.is_verified && (
                              <Badge className="bg-primary text-primary-foreground gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground capitalize mb-2">
                            {provider.business_type}
                          </p>
                          {provider.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="font-medium">{Number(provider.rating).toFixed(1)}</span>
                              <span className="text-muted-foreground">({provider.review_count} reviews)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <MessageDialog
                            recipientId={provider.user_id}
                            recipientName={provider.business_name}
                            providerId={provider.id}
                          />
                          {provider.phone && (
                            <Button variant="outline" asChild>
                              <a href={`tel:${provider.phone}`}>
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {provider.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="capitalize">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap gap-4 text-sm">
                    {(provider.city || provider.state) && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {[provider.city, provider.state, provider.country].filter(Boolean).join(", ")}
                      </div>
                    )}
                    {provider.email && (
                      <a
                        href={`mailto:${provider.email}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {provider.email}
                      </a>
                    )}
                    {provider.website && (
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services" className="gap-1">
                  <Briefcase className="w-3 h-3" />
                  Services ({listings?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-1">
                  <FolderOpen className="w-3 h-3" />
                  Projects ({projects?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Reviews ({reviews?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card className="gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="font-display">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {provider.description ? (
                      <p className="text-muted-foreground whitespace-pre-wrap">{provider.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description provided</p>
                    )}

                    {provider.address && (
                      <div className="mt-6 pt-6 border-t border-border/50">
                        <h3 className="font-medium mb-2">Address</h3>
                        <p className="text-muted-foreground">{provider.address}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                {listings && listings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <Card className="gradient-card border-border/50">
                    <CardContent className="py-12 text-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No services listed yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="projects">
                {projects && projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <Card className="gradient-card border-border/50">
                    <CardContent className="py-12 text-center">
                      <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No projects in portfolio yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="gradient-card border-border/50">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground">{review.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="gradient-card border-border/50">
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No reviews yet</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default ProviderProfile;
