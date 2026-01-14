import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Phone,
  FileText
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useConsultationTickets, ConsultationTicket } from "@/hooks/useConsultationTickets";
import { useToast } from "@/hooks/use-toast";
import { FileAttachment } from "@/components/consultation/FileAttachment";
import { format } from "date-fns";

const expertiseAreas = [
  { value: "solar", label: "Solar Energy & Installation" },
  { value: "ev", label: "Electric Vehicles & Charging" },
  { value: "smart-home", label: "Smart Home Technologies" },
  { value: "battery", label: "Battery Storage Solutions" },
  { value: "energy-audit", label: "Energy Audits & Efficiency" },
  { value: "commercial", label: "Commercial Projects" },
  { value: "other", label: "Other" },
];

const benefits = [
  { icon: Users, title: "Certified Experts", description: "Connect with verified industry specialists" },
  { icon: Zap, title: "Fast Response", description: "Get answers within 24-48 hours" },
  { icon: Shield, title: "Confidential", description: "Your information is secure and private" },
  { icon: Globe, title: "Africa-Focused", description: "Solutions tailored for African markets" },
];

const ConsultExpert = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { tickets, loading: ticketsLoading, createTicket, loadTickets } = useConsultationTickets();
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [expertise, setExpertise] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTickets, setUserTickets] = useState<ConsultationTicket[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadTickets().then((allTickets) => {
        const myTickets = allTickets.filter(t => t.user_id === user.id);
        setUserTickets(myTickets);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!subject.trim() || !description.trim() || !expertise) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const fullSubject = `[${expertiseAreas.find(e => e.value === expertise)?.label}] ${subject}`;
    
    const ticket = await createTicket(
      user.id,
      user.email || "",
      user.user_metadata?.full_name || null,
      fullSubject,
      description,
      undefined,
      attachments,
      phoneNumber || undefined
    );

    if (ticket) {
      setUserTickets(prev => [ticket, ...prev]);
      setSubject("");
      setDescription("");
      setExpertise("");
      setPhoneNumber("");
      setAttachments([]);
    }
    
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><MessageSquare className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Consult an Expert - Embraix</title>
        <meta name="description" content="Connect with certified industry specialists for personalized consultation on clean energy, EVs, and smart technologies." />
      </Helmet>

      <Header />
      
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-4">
              Expert Consultation
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Connect with <span className="text-gradient">Industry Specialists</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get personalized guidance from certified experts in clean energy, electric vehicles, 
              and smart technologies. Submit your questions and receive detailed responses within 24-48 hours.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="submit" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="submit" className="gap-2">
                <Send className="w-4 h-4" />
                Submit Question
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="w-4 h-4" />
                My Requests ({userTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Submit a Consultation Request
                  </CardTitle>
                  <CardDescription>
                    Describe your question or challenge in detail. Our experts will review and respond with personalized guidance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Area of Expertise *</Label>
                      <Select value={expertise} onValueChange={setExpertise}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the topic area" />
                        </SelectTrigger>
                        <SelectContent>
                          {expertiseAreas.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                              {area.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your question"
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground">{subject.length}/200 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide as much detail as possible about your question, including your location, budget constraints, timeline, and any specific requirements..."
                        rows={6}
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-4 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Pro Tip</p>
                        <p className="text-sm text-muted-foreground">
                          Try our free AI consultation first for instant answers. If you need more detailed, 
                          personalized guidance, submit your question to our experts here.
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="px-0 h-auto text-primary"
                          onClick={() => navigate("/chat")}
                          type="button"
                        >
                          Try AI Consult →
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Consultation Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    My Consultation Requests
                  </CardTitle>
                  <CardDescription>
                    Track the status of your submitted consultation requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : userTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No requests yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You haven't submitted any consultation requests yet.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const tabsTrigger = document.querySelector('[data-state="inactive"][value="submit"]') as HTMLButtonElement;
                          tabsTrigger?.click();
                        }}
                      >
                        Submit Your First Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTickets.map((ticket) => (
                        <div 
                          key={ticket.id} 
                          className="border border-border/50 rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-semibold text-foreground line-clamp-1">{ticket.subject}</h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Submitted: {format(new Date(ticket.created_at), "MMM d, yyyy")}</span>
                            {ticket.resolved_at && (
                              <span>Resolved: {format(new Date(ticket.resolved_at), "MMM d, yyyy")}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ConsultExpert;
