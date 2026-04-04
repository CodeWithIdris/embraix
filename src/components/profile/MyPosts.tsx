import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNews, NewsPost, NewsPostFormData } from "@/hooks/useNews";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/blog/RichTextEditor";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Image,
  Upload,
  Link,
  X,
} from "lucide-react";

export const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, loadUserPosts, createPost, updatePost, deletePost } = useNews();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState<NewsPostFormData>({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
  });

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    setLoadingPosts(true);
    const userPosts = await loadUserPosts(user.id);
    setPosts(userPosts);
    setLoadingPosts(false);
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", excerpt: "", featured_image: "" });
    setEditingPost(null);
    setImageMode("upload");
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
    });
    setImageMode(post.featured_image ? "url" : "upload");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !formData.title || !formData.content) return;

    if (editingPost) {
      const success = await updatePost(editingPost.id, formData);
      if (success) {
        setIsDialogOpen(false);
        resetForm();
        loadPosts();
      }
    } else {
      const result = await createPost(formData, user.id);
      if (result) {
        setIsDialogOpen(false);
        resetForm();
        loadPosts();
      }
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const success = await deletePost(postId);
      if (success) {
        setPosts(posts.filter((p) => p.id !== postId));
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, featured_image: publicUrlData.publicUrl });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, featured_image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const insertImageToContent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      // Append image HTML to content
      const imageHtml = `<p><img src="${publicUrlData.publicUrl}" alt="Content image" style="max-width: 100%; height: auto;" /></p>`;
      setFormData({ ...formData, content: formData.content + imageHtml });

      toast({
        title: "Success",
        description: "Image added to content",
      });
    } catch (err) {
      console.error("Error uploading image:", err);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-primary/20 text-primary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl">My Posts</CardTitle>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Post" : "Create New Post"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Post title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Excerpt (optional)</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Brief description..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* Featured Image Upload */}
              <div>
                <label className="text-sm font-medium">Featured Image</label>
                <div className="flex gap-2 mt-1 mb-2">
                  <Button
                    type="button"
                    variant={imageMode === "upload" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setImageMode("upload")}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant={imageMode === "url" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setImageMode("url")}
                  >
                    <Link className="w-4 h-4 mr-1" />
                    URL
                  </Button>
                </div>

                {imageMode === "upload" ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload an image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={formData.featured_image}
                    onChange={(e) =>
                      setFormData({ ...formData, featured_image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.featured_image && (
                  <div className="relative mt-2">
                    <img
                      src={formData.featured_image}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Content</label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={insertImageToContent}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Image className="w-4 h-4 mr-1" />
                        Add Image to Content
                      </span>
                    </Button>
                  </label>
                </div>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your post content..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={loading || !formData.title || !formData.content}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {editingPost ? "Update Post" : "Submit for Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loadingPosts ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You haven't created any posts yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "New Post" to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{post.title}</h4>
                    {getStatusBadge(post.status)}
                  </div>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground truncate">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  {post.status === "rejected" && post.rejection_reason && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {post.rejection_reason}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  {post.status === "approved" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/news/${post.id}`)}
                    >
                      View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
