import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ListingCard from "@/components/centre/ListingCard";
import ProjectCard from "@/components/centre/ProjectCard";
import ProviderImageUpload from "@/components/centre/ProviderImageUpload";
import MultiImageUpload from "@/components/centre/MultiImageUpload";
import MessagingInbox from "@/components/centre/MessagingInbox";
import { useAuth } from "@/hooks/useAuth";
import { useServiceProviders, SERVICE_CATEGORIES } from "@/hooks/useServiceProviders";
import { useServiceMessages } from "@/hooks/useServiceMessages";
import { 
  ArrowLeft, 
  Briefcase, 
  FolderOpen, 
  MessageSquare, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Loader2,
  Settings,
  Image as ImageIcon
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    myProvider, 
    myProviderLoading, 
    useProviderListings, 
    useProviderProjects,
    createListing,
    createProject,
    updateProvider
  } = useServiceProviders();
  const { messages, unreadCount } = useServiceMessages();

  const [addListingOpen, setAddListingOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    category: "" as ServiceCategory | "",
    price_range: "",
    images: [] as string[],
  });
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    client_name: "",
    location: "",
    images: [] as string[],
  });
  const [profileImages, setProfileImages] = useState({
    logo_url: myProvider?.logo_url || "",
    cover_image: myProvider?.cover_image || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listings } = useProviderListings(myProvider?.id || "");
  const { data: projects } = useProviderProjects(myProvider?.id || "");

  const handleAddListing = async () => {
    if (!myProvider || !newListing.title || !newListing.description || !newListing.category) return;
    setIsSubmitting(true);
    try {
      await createListing.mutateAsync({
        provider_id: myProvider.id,
        title: newListing.title,
        description: newListing.description,
        category: newListing.category as ServiceCategory,
        price_range: newListing.price_range || null,
        images: newListing.images.length > 0 ? newListing.images : null,
      });
      setNewListing({ title: "", description: "", category: "", price_range: "", images: [] });
      setAddListingOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProject = async () => {
    if (!myProvider || !newProject.title) return;
    setIsSubmitting(true);
    try {
      await createProject.mutateAsync({
        provider_id: myProvider.id,
        title: newProject.title,
        description: newProject.description || null,
        client_name: newProject.client_name || null,
        location: newProject.location || null,
        images: newProject.images.length > 0 ? newProject.images : null,
      });
      setNewProject({ title: "", description: "", client_name: "", location: "", images: [] });
      setAddProjectOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!myProvider) return;
    setIsSubmitting(true);
    try {
      await updateProvider.mutateAsync({
        id: myProvider.id,
        logo_url: profileImages.logo_url || null,
        cover_image: profileImages.cover_image || null,
      });
      setEditProfileOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || myProviderLoading) {
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

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!myProvider) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-md gradient-card border-border/50">
            <CardContent className="pt-6 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold mb-2">Not a Provider Yet</h2>
              <p className="text-muted-foreground mb-4">
                Register as a service provider to access your dashboard
              </p>
              <Button variant="hero" onClick={() => navigate("/centre/register")}>
                Register Now
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // Block access for non-approved providers
  if (myProvider.status !== "active") {
    return (
      <>
        <Helmet>
          <title>Account Under Review | Embraix Centre</title>
        </Helmet>
        <Header />
        <div className="min-h-screen pt-20 pb-12 bg-background flex items-center justify-center">
          <Card className="max-w-lg gradient-card border-border/50">
            <CardContent className="pt-8 pb-8 text-center">
              {myProvider.status === "pending" ? (
                <>
                  <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">Account Under Review</h2>
                  <p className="text-muted-foreground mb-4">
                    Your provider application is currently being reviewed by our team. 
                    You'll receive an email notification once your account is approved.
                  </p>
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Approval
                  </Badge>
                </>
              ) : myProvider.status === "suspended" ? (
                <>
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">Account Suspended</h2>
                  <p className="text-muted-foreground mb-4">
                    Your provider account has been suspended. Please contact support for more information.
                  </p>
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Suspended
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">Account Expired</h2>
                  <p className="text-muted-foreground mb-4">
                    Your provider subscription has expired. Please renew to continue using the dashboard.
                  </p>
                </>
              )}
              <div className="mt-6">
                <Button variant="outline" onClick={() => navigate("/centre")}>
                  Back to Centre
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "suspended":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "suspended":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Provider Dashboard | Embraix Centre</title>
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/centre")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {myProvider.business_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(myProvider.status)}>
                  {getStatusIcon(myProvider.status)}
                  <span className="ml-1 capitalize">{myProvider.status}</span>
                </Badge>
                {myProvider.is_verified && (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/centre/provider/${myProvider.id}`)}>
                View Public Profile
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Provider is active - show dashboard content */}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="gradient-card border-border/50">
              <CardContent className="pt-6">
                <Briefcase className="w-6 h-6 text-primary mb-2" />
                <p className="font-display text-2xl font-bold">{listings?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Services</p>
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50">
              <CardContent className="pt-6">
                <FolderOpen className="w-6 h-6 text-primary mb-2" />
                <p className="font-display text-2xl font-bold">{projects?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50">
              <CardContent className="pt-6">
                <MessageSquare className="w-6 h-6 text-primary mb-2" />
                <p className="font-display text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </CardContent>
            </Card>
            <Card className="gradient-card border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < Math.floor(Number(myProvider.rating)) ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-display text-2xl font-bold">
                  {Number(myProvider.rating).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">{myProvider.review_count} Reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList>
              <TabsTrigger value="services" className="gap-1">
                <Briefcase className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="projects" className="gap-1">
                <FolderOpen className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-1">
                <MessageSquare className="w-4 h-4" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Your Services</h2>
                <Dialog open={addListingOpen} onOpenChange={setAddListingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Add New Service</DialogTitle>
                      <DialogDescription>
                        Create a new service listing for your customers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={newListing.title}
                          onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                          placeholder="Service title"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={newListing.category}
                          onValueChange={(v) => setNewListing({ ...newListing, category: v as ServiceCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newListing.description}
                          onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                          placeholder="Describe your service..."
                        />
                      </div>
                      <div>
                        <Label>Price Range (optional)</Label>
                        <Input
                          value={newListing.price_range}
                          onChange={(e) => setNewListing({ ...newListing, price_range: e.target.value })}
                          placeholder="e.g., ₦10,000 - ₦50,000"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAddListingOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="hero"
                        onClick={handleAddListing}
                        disabled={!newListing.title || !newListing.description || !newListing.category || isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Add Service
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <Card className="gradient-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No services listed yet</p>
                    <Button variant="hero" onClick={() => setAddListingOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="projects">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold">Your Projects</h2>
                <Dialog open={addProjectOpen} onOpenChange={setAddProjectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Add Project to Portfolio</DialogTitle>
                      <DialogDescription>
                        Showcase your work to potential customers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Project Title</Label>
                        <Input
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          placeholder="Project title"
                        />
                      </div>
                      <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Describe the project..."
                        />
                      </div>
                      <div>
                        <Label>Client Name (optional)</Label>
                        <Input
                          value={newProject.client_name}
                          onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })}
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <Label>Location (optional)</Label>
                        <Input
                          value={newProject.location}
                          onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                          placeholder="Project location"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAddProjectOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="hero"
                        onClick={handleAddProject}
                        disabled={!newProject.title || isSubmitting}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Add Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <Card className="gradient-card border-border/50">
                  <CardContent className="py-12 text-center">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No projects in your portfolio yet</p>
                    <Button variant="hero" onClick={() => setAddProjectOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages">
              <MessagingInbox />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default ProviderDashboard;

