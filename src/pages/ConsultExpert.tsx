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
  Phone,
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
        <div className="container mx-auto px-4 max-w-3xl">
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
          <div className="text-center mb-8">
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Expert Consultation
            </span>
            <h1 className="font-display text-2xl md:text-4xl font-bold mb-3">
              Connect with <span className="text-gradient">Specialists</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Get personalized guidance from certified experts. Submit your questions and receive responses within 24-48 hours.
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="submit">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="submit" className="gap-2 text-sm">
                <Send className="w-4 h-4" />
                Submit Question
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-sm">
                <Clock className="w-4 h-4" />
                My Requests ({userTickets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    Submit Request
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Describe your question in detail. Our experts will review and respond.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="expertise" className="text-sm">Area of Expertise *</Label>
                      <Select value={expertise} onValueChange={setExpertise}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic area" />
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
                      <Label htmlFor="subject" className="text-sm">Subject *</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your question"
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">Details *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details including location, budget, timeline, and specific requirements..."
                        rows={5}
                        maxLength={2000}
                      />
                      <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          Phone (optional)
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+234 800 000 0000"
                        />
                      </div>
                    </div>

                    {user && (
                      <div className="space-y-2">
                        <Label className="text-sm">Attachments (optional)</Label>
                        <FileAttachment
                          userId={user.id}
                          onFilesChange={setAttachments}
                          existingFiles={attachments}
                        />
                      </div>
                    )}

                    <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Tip:</span>{" "}
                        <span className="text-muted-foreground">Try our </span>
                        <button 
                          type="button"
                          onClick={() => navigate("/chat")} 
                          className="text-primary hover:underline"
                        >
                          free AI consultation
                        </button>
                        <span className="text-muted-foreground"> for instant answers.</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="hero" 
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
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    My Requests
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Track the status of your consultation requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : userTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">No requests yet</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven't submitted any requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userTickets.map((ticket) => (
                        <div 
                          key={ticket.id} 
                          className="border border-border/50 rounded-lg p-4 hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-medium text-foreground text-sm line-clamp-1">{ticket.subject}</h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {ticket.description}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(ticket.created_at), "MMM d, yyyy")}
                          </div>
                          
                          {/* Expert Reply */}
                          {ticket.expert_reply && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-medium text-foreground">Expert Response</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{ticket.expert_reply}</p>
                            </div>
                          )}
                          
                          {/* Call Scheduled */}
                          {ticket.call_scheduled_at && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span className="text-xs text-foreground">
                                  Call scheduled: {format(new Date(ticket.call_scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            </div>
                          )}
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
