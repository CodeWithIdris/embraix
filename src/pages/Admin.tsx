import { useState, useEffect } from "react";
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
import {
  ArrowLeft, Plus, Edit, Trash2, FileText, Loader2, CheckCircle, Clock, Send, 
  X, Bell, Ticket, Newspaper, BookOpen, AlertCircle
} from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading, isWriter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories, tags, loading, loadArticles, createArticle, updateArticle, deleteArticle, generateSlug } = useBlog();
  const { loadPendingPosts, approvePost, rejectPost } = useNews();
  const { tickets, newTicketCount, loadTickets, updateTicketStatus, subscribeToNewTickets } = useConsultationTickets();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [pendingPosts, setPendingPosts] = useState<NewsPost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "", slug: "", excerpt: "", content: "", featured_image: "", category_id: "", tag_ids: [], status: "draft"
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
    const success = await approvePost(postId);
    if (success) {
      setPendingPosts(pendingPosts.filter(p => p.id !== postId));
    }
  };

  const handleRejectPost = async () => {
    if (!selectedPostId) return;
    const success = await rejectPost(selectedPostId, rejectReason);
    if (success) {
      setPendingPosts(pendingPosts.filter(p => p.id !== selectedPostId));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-primary/20 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case "pending": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

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
        </header>

        <main className="container mx-auto p-6">
          <Tabs defaultValue="articles" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="articles" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Articles
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="posts" className="gap-2">
                    <Newspaper className="w-4 h-4" />
                    Pending Posts
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

            {/* Pending Posts Tab (Admin Only) */}
            {isAdmin && (
              <TabsContent value="posts">
                {pendingPosts.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">No pending posts to review!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {pendingPosts.map(post => (
                      <Card key={post.id} className="gradient-card border-border/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg font-display">{post.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                By {post.author?.full_name || post.author?.email || "Unknown"} • {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="hero" onClick={() => handleApprovePost(post.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => { setSelectedPostId(post.id); setRejectDialogOpen(true); }}>
                                <X className="w-4 h-4 mr-1" />Reject
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {post.excerpt && <p className="text-sm text-muted-foreground mb-2">{post.excerpt}</p>}
                          <div className="text-sm text-foreground/80 line-clamp-4">{post.content}</div>
                        </CardContent>
                      </Card>
                    ))}
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
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-display">{ticket.subject}</CardTitle>
                                {getTicketStatusBadge(ticket.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticket.user_name || ticket.user_email} • {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
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
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-foreground/80">{ticket.description}</p>
                          {ticket.ai_context && (
                            <div className="bg-secondary/30 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">AI Chat Context:</p>
                              <p className="text-sm text-foreground/70">{ticket.ai_context}</p>
                            </div>
                          )}
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>📧 {ticket.user_email}</span>
                            <span>•</span>
                            <span>Priority: {ticket.priority}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
