import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  MapPin,
  Star,
  Clock,
  Briefcase,
  CheckCircle2,
  Award,
  GraduationCap,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  Languages,
  Loader2,
  ArrowLeft,
  CalendarIcon,
  Send,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExpertProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  professional_title: string | null;
  expertise_areas: string[];
  experience_years: number | null;
  bio: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  languages: string[] | null;
  linkedin: string | null;
  portfolio: string | null;
  avatar_url: string | null;
  hourly_rate: string | null;
  badges: string[] | null;
  certifications: string[] | null;
  rating: number;
  review_count: number;
  consultation_count: number;
  is_available: boolean;
}

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const ExpertProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
    preferredDate: undefined as Date | undefined,
    preferredTime: "",
  });

  const { data: expert, isLoading, error } = useQuery({
    queryKey: ["expert-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ExpertProfile;
    },
    enabled: !!id,
  });

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

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to request a consultation.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.topic.trim() || !formData.message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("consultation_requests").insert({
        expert_id: id,
        user_id: user.id,
        user_name: formData.name.trim(),
        user_email: formData.email.trim(),
        topic: formData.topic.trim(),
        message: formData.message.trim(),
        preferred_date: formData.preferredDate ? format(formData.preferredDate, "yyyy-MM-dd") : null,
        preferred_time: formData.preferredTime || null,
      });

      if (error) throw error;

      // Notify expert
      await supabase.from("notifications").insert({
        user_id: expert!.user_id,
        type: "consultation_request",
        title: "New Consultation Request",
        message: `${formData.name} has requested a consultation on "${formData.topic}".`,
        reference_id: id,
        reference_type: "consultation_request",
      });

      // Notify admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin" as any);

      if (admins) {
        for (const admin of admins) {
          await supabase.from("notifications").insert({
            user_id: admin.user_id,
            type: "consultation_request",
            title: "New Consultation Request",
            message: `${formData.name} requested a consultation with ${expert!.full_name}.`,
            reference_id: id,
            reference_type: "consultation_request",
          });
        }
      }

      toast({
        title: "Request Sent!",
        description: "The expert will be notified and respond to your request.",
      });

      setShowRequestDialog(false);
      setFormData({
        name: user ? formData.name : "",
        email: user ? formData.email : "",
        topic: "",
        message: "",
        preferredDate: undefined,
        preferredTime: "",
      });
    } catch (err: any) {
      console.error("Error submitting request:", err);
      toast({
        title: "Error",
        description: "Failed to submit consultation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4" />;
      case "certified":
        return <Award className="w-4 h-4" />;
      case "researcher":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !expert) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Expert Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This expert profile doesn't exist or is no longer available.
            </p>
            <Button onClick={() => navigate("/centre/experts")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experts
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{expert.full_name} - Expert Profile | Embraix</title>
        <meta
          name="description"
          content={`Consult with ${expert.full_name}, a clean energy expert specializing in ${expert.expertise_areas?.slice(0, 2).join(", ")} on Embraix.`}
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate("/centre/experts")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experts
          </Button>

          {/* Profile Header */}
          <Card className="gradient-card border-border/50 mb-6">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/20 mx-auto md:mx-0">
                  <AvatarImage src={expert.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl md:text-3xl font-bold">
                    {expert.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                    <h1 className="font-display text-2xl md:text-3xl font-bold">
                      {expert.full_name}
                    </h1>
                    {expert.is_available && (
                      <Badge className="bg-green-500/20 text-green-500 w-fit mx-auto md:mx-0">
                        Available
                      </Badge>
                    )}
                  </div>

                  {expert.professional_title && (
                    <p className="text-lg text-muted-foreground mb-2">
                      {expert.professional_title}
                    </p>
                  )}

                  {(expert.city || expert.country) && (
                    <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1 mb-4">
                      <MapPin className="w-4 h-4" />
                      {[expert.city, expert.country].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {/* Badges */}
                  {expert.badges && expert.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {expert.badges.map((badge) => (
                        <Badge
                          key={badge}
                          className="gap-1 bg-primary/10 text-primary border-primary/20"
                        >
                          {getBadgeIcon(badge)}
                          {getBadgeLabel(badge)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 justify-center md:justify-start text-sm">
                    {expert.experience_years && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <strong>{expert.experience_years}+</strong> years
                      </span>
                    )}
                    {expert.rating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <strong>{expert.rating.toFixed(1)}</strong>
                        <span className="text-muted-foreground">
                          ({expert.review_count} reviews)
                        </span>
                      </span>
                    )}
                    {expert.consultation_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <strong>{expert.consultation_count}</strong> consultations
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 md:mt-0">
                  <Button variant="hero" size="lg" onClick={() => setShowRequestDialog(true)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request Consultation
                  </Button>
                  {expert.hourly_rate && (
                    <p className="text-center text-sm text-muted-foreground">
                      Starting at <strong className="text-foreground">{expert.hourly_rate}</strong>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              {expert.bio && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{expert.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Expertise */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {expert.expertise_areas?.map((area) => (
                      <Badge key={area} variant="secondary" className="capitalize">
                        {area.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              {expert.certifications && expert.certifications.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {expert.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-primary" />
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {expert.languages && expert.languages.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Languages className="w-4 h-4 text-muted-foreground" />
                      <span>{expert.languages.join(", ")}</span>
                    </div>
                  )}
                  {expert.linkedin && (
                    <a
                      href={expert.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                  {expert.portfolio && (
                    <a
                      href={expert.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Portfolio / Website
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Quick Action */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Request a consultation with {expert.full_name.split(" ")[0]}
                  </p>
                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowRequestDialog(true)}
                  >
                    Request Consultation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Consultation Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Consultation</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a consultation with {expert.full_name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Consultation Topic *</Label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Solar installation for my home"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.preferredDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.preferredDate
                        ? format(formData.preferredDate, "MMM d, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.preferredDate}
                      onSelect={(date) => setFormData({ ...formData, preferredDate: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select
                  value={formData.preferredTime}
                  onValueChange={(v) => setFormData({ ...formData, preferredTime: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message / Problem Description *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe what you need help with..."
                rows={4}
              />
            </div>

            <Button
              variant="hero"
              className="w-full"
              onClick={handleSubmitRequest}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpertProfilePage;
