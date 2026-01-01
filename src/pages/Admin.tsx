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
import { useAuth } from "@/hooks/useAuth";
import { useBlog, Article, ArticleFormData } from "@/hooks/useBlog";
import RichTextEditor from "@/components/blog/RichTextEditor";
import {
  ArrowLeft, Plus, Edit, Trash2, Eye, FileText, Loader2, CheckCircle, Clock, Send
} from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading, isWriter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { categories, tags, loading, loadArticles, createArticle, updateArticle, deleteArticle, generateSlug } = useBlog();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "", slug: "", excerpt: "", content: "", featured_image: "", category_id: "", tag_ids: [], status: "draft"
  });

  useEffect(() => {
    if (!authLoading && (!user || !isWriter)) {
      navigate("/auth");
    }
  }, [user, authLoading, isWriter, navigate]);

  useEffect(() => {
    if (user && isWriter) {
      loadArticles(isAdmin ? {} : { authorId: user.id }).then(setArticles);
    }
  }, [user, isWriter, isAdmin]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-primary/20 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case "pending": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Draft</Badge>;
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
              <h1 className="font-display text-xl font-bold">Blog Dashboard</h1>
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
        </main>
      </div>
    </>
  );
};

export default Admin;
