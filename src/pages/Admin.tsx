import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useBlog, Article, ArticleFormData } from "@/hooks/useBlog";
import { useNews, NewsPost } from "@/hooks/useNews";
import { useConsultationTickets, ConsultationTicket } from "@/hooks/useConsultationTickets";
import RichTextEditor from "@/components/blog/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { UserRolesManager } from "@/components/admin/UserRolesManager";
import { TicketReplyDialog } from "@/components/admin/TicketReplyDialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  ArrowLeft, Plus, Edit, Trash2, FileText, Loader2, CheckCircle, Clock, Send, 
  X, Ticket, Newspaper, BookOpen, AlertCircle, Rocket, Users, MessageSquare, Phone, Building2, GraduationCap, TrendingUp, Mail, UserPlus, Wrench, ShoppingBag
} from "lucide-react";
import ProvidersManager from "@/components/admin/ProvidersManager";
import { ExpertApplicationsManager } from "@/components/admin/ExpertApplicationsManager";
import { ExpertAnalytics } from "@/components/admin/ExpertAnalytics";
import { PlatformAnalytics } from "@/components/admin/PlatformAnalytics";
import GrowthAnalytics from "@/components/GrowthAnalytics";
import WaitlistManager from "@/components/admin/WaitlistManager";
import NewsletterManager from "@/components/admin/NewsletterManager";
import EmailCampaigns from "@/components/admin/EmailCampaigns";
import NewsAutomation from "@/components/admin/NewsAutomation";
import { ServiceRequestsManager } from "@/components/admin/ServiceRequestsManager";
import { InstallersManager } from "@/components/admin/InstallersManager";
import ResearchManager from "@/components/admin/ResearchManager";
import StoreProductsManager from "@/components/admin/StoreProductsManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

// Pending installers badge
const PendingInstallersBadge = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    supabase.from("installers").select("id", { count: "exact", head: true }).eq("status", "pending").then(({ count: c }) => {
      if (c) setCount(c);
    });
  }, []);
  return count > 0 ? <Badge variant="destructive" className="ml-1">{count}</Badge> : null;
};

// Pending experts badge component
const PendingExpertsBadge = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    supabase.from("expert_applications").select("id", { count: "exact", head: true }).eq("status", "pending").then(({ count: c }) => {
      if (c) setCount(c);
    });
  }, []);
  return count > 0 ? <Badge variant="destructive" className="ml-1">{count}</Badge> : null;
};

const Admin = () => {
  const { user, loading: authLoading, isWriter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, tags, loading, loadArticles, createArticle, updateArticle, deleteArticle, generateSlug } = useBlog();
  const { loading: newsLoading, loadApprovedPosts, loadPendingPosts, loadAllPosts, approvePost, rejectPost, deletePost: deleteNewsPost, updatePost: updateNewsPost } = useNews();
  const { tickets, newTicketCount, loadTickets, updateTicketStatus, submitExpertReply, scheduleCall, subscribeToNewTickets } = useConsultationTickets();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingPosts, setPendingPosts] = useState<NewsPost[]>([]);
  const [allNewsPosts, setAllNewsPosts] = useState<NewsPost[]>([]);
  const [newsFilter, setNewsFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "", slug: "", excerpt: "", content: "", featured_image: "", category_id: "", tag_ids: [], status: "draft"
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ConsultationTicket | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editPostForm, setEditPostForm] = useState({ title: "", content: "", excerpt: "", featured_image: "" });
  const [postSortField, setPostSortField] = useState<string>("date");
  const [postSortDir, setPostSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!authLoading && (!user || !isWriter)) {
      navigate("/auth");
    }
  }, [user, authLoading, isWriter, navigate]);

  useEffect(() => {
    if (user && isWriter) {
      loadArticles(isAdmin ? {} : { authorId: user.id }).then(setArticles);
    }
    if (user && isAdmin) {
      loadPendingPosts().then(setPendingPosts);
      loadAllPosts().then(setAllNewsPosts);
      loadTickets();
    }
  }, [user, isWriter, isAdmin]);

  // Real-time ticket notifications for admins
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = subscribeToNewTickets((ticket) => {
      toast({
        title: "🔔 New Consultation Request",
        description: `${ticket.user_name || ticket.user_email} needs expert help`,
      });
    });

    return unsubscribe;
  }, [isAdmin]);

  const resetForm = () => {
    setFormData({ title: "", slug: "", excerpt: "", content: "", featured_image: "", category_id: "", tag_ids: [], status: "draft" });
    setEditingArticle(null);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      featured_image: article.featured_image || "",
      category_id: article.category_id || "",
      tag_ids: article.tags?.map(t => t.id) || [],
      status: article.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    let success: boolean;
    if (editingArticle) {
      success = await updateArticle(editingArticle.id, formData);
    } else {
      const result = await createArticle(formData, user.id);
      success = result !== null;
    }
    
    if (success) {
      setIsDialogOpen(false);
      resetForm();
      loadArticles(isAdmin ? {} : { authorId: user.id }).then(setArticles);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      const success = await deleteArticle(id);
      if (success) {
        setArticles(articles.filter(a => a.id !== id));
      }
    }
  };

  const handleApprovePost = async (postId: string) => {
    const postToApprove = pendingPosts.find(p => p.id === postId);
    const success = await approvePost(postId);
    if (success) {
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
      
      // Send approval email notification - look up email from profiles (admin has access)
      if (postToApprove) {
        try {
          const { data: authorProfile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", postToApprove.author_id)
            .single();
          
          if (authorProfile?.email) {
            await supabase.functions.invoke("send-notification-email", {
              body: {
                type: "post_approved",
                recipientEmail: authorProfile.email,
                recipientName: authorProfile.full_name,
                data: {
                  postTitle: postToApprove.title,
                  postUrl: `${window.location.origin}/news/${postId}`,
                },
              },
            });
            console.log("Approval email sent");
          }
        } catch (err) {
          console.error("Failed to send approval email:", err);
        }
      }
    }
  };

  const handleRejectPost = async () => {
    if (!selectedPostId) return;
    const postToReject = pendingPosts.find(p => p.id === selectedPostId);
    const success = await rejectPost(selectedPostId, rejectReason);
    if (success) {
      setPendingPosts(pendingPosts.filter(p => p.id !== selectedPostId));
      
      // Send rejection email notification - look up email from profiles (admin has access)
      if (postToReject) {
        try {
          const { data: authorProfile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", postToReject.author_id)
            .single();
          
          if (authorProfile?.email) {
            await supabase.functions.invoke("send-notification-email", {
              body: {
                type: "post_rejected",
                recipientEmail: authorProfile.email,
                recipientName: authorProfile.full_name,
                data: {
                  postTitle: postToReject.title,
                  reason: rejectReason,
                },
              },
            });
            console.log("Rejection email sent");
          }
        } catch (err) {
          console.error("Failed to send rejection email:", err);
        }
      }
      
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedPostId(null);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    const success = await updateTicketStatus(ticketId, status);
    if (success) {
      loadTickets();
    }
  };

  const handleExpertReply = async (ticketId: string, reply: string): Promise<boolean> => {
    if (!user) return false;
    
    const ticket = tickets.find(t => t.id === ticketId);
    const success = await submitExpertReply(ticketId, user.id, reply);
    
    if (success && ticket) {
      // Send email notification
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "expert_reply",
            recipientEmail: ticket.user_email,
            recipientName: ticket.user_name,
            data: {
              subject: ticket.subject,
              reply: reply,
              consultUrl: `${window.location.origin}/consult-expert`,
            },
          },
        });
      } catch (err) {
        console.error("Failed to send reply notification:", err);
      }
      loadTickets();
    }
    return success;
  };

  const handleScheduleCall = async (ticketId: string, scheduledAt: Date, notes: string): Promise<boolean> => {
    if (!user) return false;
    
    const ticket = tickets.find(t => t.id === ticketId);
    const success = await scheduleCall(ticketId, user.id, scheduledAt, notes);
    
    if (success && ticket) {
      // Send email notification
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "call_scheduled",
            recipientEmail: ticket.user_email,
            recipientName: ticket.user_name,
            data: {
              subject: ticket.subject,
              scheduledAt: format(scheduledAt, "PPPP 'at' p"),
              notes: notes,
            },
          },
        });
      } catch (err) {
        console.error("Failed to send call notification:", err);
      }
      loadTickets();
    }
    return success;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-primary/20 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case "pending": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  const handleEditPost = (post: NewsPost) => {
    setEditingPost(post);
    setEditPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
    });
    setEditPostDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    const success = await updateNewsPost(editingPost.id, {
      title: editPostForm.title,
      content: editPostForm.content,
      excerpt: editPostForm.excerpt || undefined,
      featured_image: editPostForm.featured_image || undefined,
    });
    if (success) {
      setEditPostDialogOpen(false);
      setEditingPost(null);
      loadAllPosts().then(setAllNewsPosts);
      loadPendingPosts().then(setPendingPosts);
    }
  };

  const sortedFilteredPosts = useMemo(() => {
    let posts = newsFilter === "all" ? allNewsPosts : allNewsPosts.filter(p => p.status === newsFilter);
    posts = [...posts].sort((a, b) => {
      let cmp = 0;
      if (postSortField === "date") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (postSortField === "title") cmp = a.title.localeCompare(b.title);
      else if (postSortField === "status") cmp = a.status.localeCompare(b.status);
      return postSortDir === "desc" ? -cmp : cmp;
    });
    return posts;
  }, [allNewsPosts, newsFilter, postSortField, postSortDir]);

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-orange-500/20 text-orange-500"><AlertCircle className="w-3 h-3 mr-1" />Open</Badge>;
      case "in_progress": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "resolved": return <Badge className="bg-primary/20 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case "closed": return <Badge variant="outline"><X className="w-3 h-3 mr-1" />Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet><title>Admin Dashboard | Embraix</title></Helmet>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
              <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <AdminNotificationBell />
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button variant="hero"><Plus className="w-4 h-4 mr-2" />New Article</Button></DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingArticle ? "Edit Article" : "Create New Article"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Article title" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Slug</label>
                      <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="article-slug" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Excerpt</label>
                    <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief description..." className="mt-1" rows={2} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <div className="mt-1"><RichTextEditor value={formData.content} onChange={(content) => setFormData({ ...formData, content })} placeholder="Write your article..." /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Featured Image URL</label>
                      <Input value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} placeholder="https://..." className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <Badge key={tag.id} variant={formData.tag_ids.includes(tag.id) ? "default" : "outline"} className="cursor-pointer" onClick={() => setFormData({ ...formData, tag_ids: formData.tag_ids.includes(tag.id) ? formData.tag_ids.filter(id => id !== tag.id) : [...formData.tag_ids, tag.id] })}>{tag.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setFormData({ ...formData, status: "draft" }); handleSubmit(); }}><FileText className="w-4 h-4 mr-2" />Save Draft</Button>
                    {!isAdmin && <Button variant="secondary" onClick={() => { setFormData({ ...formData, status: "pending" }); handleSubmit(); }}><Send className="w-4 h-4 mr-2" />Submit for Review</Button>}
                    {isAdmin && <Button variant="hero" onClick={() => { setFormData({ ...formData, status: "published" }); handleSubmit(); }}><CheckCircle className="w-4 h-4 mr-2" />Publish</Button>}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-12 lg:w-auto lg:inline-grid">
              <TabsTrigger value="articles" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Articles
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="projects" className="gap-2">
                    <Rocket className="w-4 h-4" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="gap-2">
                    <Newspaper className="w-4 h-4" />
                    Posts
                    {pendingPosts.length > 0 && (
                      <Badge variant="destructive" className="ml-1">{pendingPosts.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="tickets" className="gap-2">
                    <Ticket className="w-4 h-4" />
                    Tickets
                    {newTicketCount > 0 && (
                      <Badge variant="destructive" className="ml-1">{newTicketCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="providers" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Providers
                  </TabsTrigger>
                  <TabsTrigger value="experts" className="gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Experts
                    <PendingExpertsBadge />
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-2">
                    <Users className="w-4 h-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="waitlist" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Waitlist
                  </TabsTrigger>
                  <TabsTrigger value="newsletter" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Newsletter
                  </TabsTrigger>
                  <TabsTrigger value="campaigns" className="gap-2">
                    <Send className="w-4 h-4" />
                    Campaigns
                  </TabsTrigger>
                   <TabsTrigger value="automation" className="gap-2">
                     <Newspaper className="w-4 h-4" />
                     Automation
                   </TabsTrigger>
                   <TabsTrigger value="service-requests" className="gap-2">
                     <Wrench className="w-4 h-4" />
                     Services
                   </TabsTrigger>
                   <TabsTrigger value="installers" className="gap-2">
                      <Wrench className="w-4 h-4" />
                      Installers
                      <PendingInstallersBadge />
                    </TabsTrigger>
                    <TabsTrigger value="research" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Research
                    </TabsTrigger>
                    <TabsTrigger value="store" className="gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Store
                    </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Articles Tab */}
            <TabsContent value="articles">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : articles.length === 0 ? (
                <Card className="text-center py-12"><CardContent><FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No articles yet. Create your first one!</p></CardContent></Card>
              ) : (
                <div className="grid gap-4">
                  {articles.map(article => (
                    <Card key={article.id} className="gradient-card border-border/50">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-display">{article.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(article.status)}
                            {article.category && <Badge variant="secondary">{article.category.name}</Badge>}
                            <span className="text-xs text-muted-foreground">{new Date(article.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}><Edit className="w-4 h-4" /></Button>
                          {isAdmin && <Button variant="ghost" size="sm" onClick={() => handleDelete(article.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                        </div>
                      </CardHeader>
                      {article.excerpt && <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p></CardContent>}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Projects Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="projects">
                <ProjectsManager />
              </TabsContent>
            )}

            {/* Pending Posts Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="posts">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{allNewsPosts.length}</p><p className="text-xs text-muted-foreground">Total Posts</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{allNewsPosts.filter(p => p.status === 'approved').length}</p><p className="text-xs text-muted-foreground">Published</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-500">{allNewsPosts.filter(p => p.status === 'pending').length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{allNewsPosts.filter(p => p.status === 'rejected').length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
                </div>

                {/* Filter & Sort */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Select value={newsFilter} onValueChange={setNewsFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      <SelectItem value="approved">Published</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={postSortField} onValueChange={setPostSortField}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="title">Sort by Title</SelectItem>
                      <SelectItem value="status">Sort by Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setPostSortDir(d => d === "asc" ? "desc" : "asc")}>
                    {postSortDir === "desc" ? "↓ Newest" : "↑ Oldest"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {sortedFilteredPosts.length} posts
                  </span>
                </div>

                {/* Posts Table */}
                {allNewsPosts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No news posts yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50">
                          <tr>
                            <th className="text-left p-3 font-medium">Title</th>
                            <th className="text-left p-3 font-medium hidden md:table-cell">Author</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                            <th className="text-right p-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {sortedFilteredPosts.map(post => (
                            <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="p-3">
                                <button onClick={() => navigate(`/news/${post.id}`)} className="text-left hover:text-primary transition-colors font-medium line-clamp-1">
                                  {post.title}
                                </button>
                              </td>
                              <td className="p-3 hidden md:table-cell text-muted-foreground">
                                {post.author?.full_name || "System"}
                              </td>
                              <td className="p-3">
                                {post.status === "approved" && <Badge className="bg-primary/20 text-primary text-xs">Published</Badge>}
                                {post.status === "pending" && <Badge variant="secondary" className="text-xs">Pending</Badge>}
                                {post.status === "rejected" && <Badge variant="destructive" className="text-xs">Rejected</Badge>}
                              </td>
                              <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                                {new Date(post.created_at).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {post.status === "pending" && (
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={() => handleApprovePost(post.id)}>
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Publish
                                    </Button>
                                  )}
                                  {post.status !== "approved" && (
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={async () => {
                                      const success = await approvePost(post.id);
                                      if (success) { loadAllPosts().then(setAllNewsPosts); loadPendingPosts().then(setPendingPosts); }
                                    }}>
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Publish
                                    </Button>
                                  )}
                                  {post.status === "approved" && (
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={async () => {
                                      const { error } = await supabase.from("news_posts").update({ status: "pending", published_at: null } as any).eq("id", post.id);
                                      if (!error) { loadAllPosts().then(setAllNewsPosts); loadPendingPosts().then(setPendingPosts); }
                                    }}>
                                      Unpublish
                                    </Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={async () => {
                                    if (confirm("Delete this post?")) {
                                      const success = await deleteNewsPost(post.id);
                                      if (success) { setAllNewsPosts(prev => prev.filter(p => p.id !== post.id)); setPendingPosts(prev => prev.filter(p => p.id !== post.id)); }
                                    }
                                  }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium">Reason for rejection</label>
                        <Textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Please provide a reason..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRejectPost}>Reject Post</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            )}

            {/* Tickets Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="tickets">
                {tickets.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No consultation tickets yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {tickets.map(ticket => (
                      <Card key={ticket.id} className="gradient-card border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg font-display">{ticket.subject}</CardTitle>
                                {getTicketStatusBadge(ticket.status)}
                                {ticket.call_scheduled_at && (
                                  <Badge variant="outline" className="text-blue-500 border-blue-500">
                                    <Phone className="w-3 h-3 mr-1" />
                                    Call: {format(new Date(ticket.call_scheduled_at), "MMM d, h:mm a")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.user_name || ticket.user_email} • {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => { setSelectedTicket(ticket); setReplyDialogOpen(true); }}
                                disabled={ticket.status === "resolved" || ticket.status === "closed"}
                              >
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Reply
                              </Button>
                              <Select value={ticket.status} onValueChange={(value) => handleTicketStatusChange(ticket.id, value)}>
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-foreground/80">{ticket.description}</p>
                          
                          {ticket.attachments && ticket.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {ticket.attachments.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded"
                                >
                                  <FileText className="w-3 h-3" />
                                  Attachment {index + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          
                          {ticket.ai_context && (
                            <div className="bg-secondary/30 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">AI Chat Context:</p>
                              <p className="text-sm text-foreground/70">{ticket.ai_context}</p>
                            </div>
                          )}
                          
                          {ticket.expert_reply && (
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                              <p className="text-xs text-primary mb-1">Expert Reply ({ticket.expert_reply_at ? format(new Date(ticket.expert_reply_at), "MMM d, yyyy") : ""}):</p>
                              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{ticket.expert_reply}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>📧 {ticket.user_email}</span>
                            <span>•</span>
                            <span>Priority: {ticket.priority}</span>
                            {ticket.phone_number && (
                              <>
                                <span>•</span>
                                <span>📞 {ticket.phone_number}</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <TicketReplyDialog
                  ticket={selectedTicket}
                  open={replyDialogOpen}
                  onOpenChange={setReplyDialogOpen}
                  onSubmitReply={handleExpertReply}
                  onScheduleCall={handleScheduleCall}
                />
              </TabsContent>
            )}

            {/* Providers Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="providers">
                <ProvidersManager />
              </TabsContent>
            )}

            {/* Experts Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="experts">
                <ExpertApplicationsManager />
              </TabsContent>
            )}

            {/* Analytics Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="analytics">
                <AnalyticsDashboard />
                <div className="mt-8">
                  <PlatformAnalytics />
                </div>
                <div className="mt-8">
                  <ExpertAnalytics />
                </div>
                <div className="mt-8">
                  <GrowthAnalytics />
                </div>
              </TabsContent>
            )}

            {/* Users Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="users">
                <UserRolesManager />
              </TabsContent>
            )}

            {/* Waitlist Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="waitlist">
                <WaitlistManager />
              </TabsContent>
            )}

            {/* Newsletter Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="newsletter">
                <NewsletterManager />
              </TabsContent>
            )}

            {/* Email Campaigns Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="campaigns">
                <EmailCampaigns />
              </TabsContent>
            )}

             {/* Automation Tab (Admin Only) */}
             {isAdmin && (
               <TabsContent value="automation">
                 <NewsAutomation />
               </TabsContent>
             )}

             {/* Service Requests Tab (Admin Only) */}
             {isAdmin && (
               <TabsContent value="service-requests">
                 <ServiceRequestsManager />
               </TabsContent>
             )}

             {/* Installers Tab (Admin Only) */}
             {isAdmin && (
               <TabsContent value="installers">
                 <InstallersManager />
               </TabsContent>
             )}

             {/* Research Tab (Admin Only) */}
             {isAdmin && (
               <TabsContent value="research">
                 <ResearchManager />
               </TabsContent>
             )}

             {/* Store Products Tab (Admin Only) */}
             {isAdmin && (
               <TabsContent value="store">
                 <StoreProductsManager />
               </TabsContent>
             )}
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
