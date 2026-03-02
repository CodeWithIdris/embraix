import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/blog/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Image, Upload, Link, X, Video, Headphones
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface RichPostEditorProps {
  categories: Category[];
  onSubmit: (data: {
    title: string;
    content: string;
    excerpt: string;
    featured_image: string;
    category_id: string;
    content_type: string;
  }) => Promise<void>;
  submitting: boolean;
}

const RichPostEditor = ({ categories, onSubmit, submitting }: RichPostEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [contentType, setContentType] = useState("article");
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

  // Embed dialog
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedType, setEmbedType] = useState<"video" | "audio">("video");
  const [embedUrl, setEmbedUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "featured" | "content") => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `${user.id}/posts/${fileName}`;

      const { error } = await supabase.storage.from("post-images").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

      if (target === "featured") {
        setFeaturedImage(data.publicUrl);
      } else {
        const imgHtml = `<figure><img src="${data.publicUrl}" alt="Content image" style="max-width:100%;height:auto;border-radius:8px;" /><figcaption style="text-align:center;color:gray;font-size:0.875rem;">Image caption</figcaption></figure>`;
        setContent(prev => prev + imgHtml);
      }
      toast({ title: "Image uploaded" });
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const insertEmbed = () => {
    if (!embedUrl.trim()) return;

    let html = "";
    if (embedType === "video") {
      // YouTube
      const ytMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) {
        html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe></div>`;
        setContentType("video");
      }
      // Vimeo
      const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0;"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe></div>`;
        setContentType("video");
      }
      if (!html) {
        html = `<div style="margin:1rem 0;"><video controls style="width:100%;border-radius:8px;" preload="metadata"><source src="${embedUrl}" /></video></div>`;
        setContentType("video");
      }
    } else {
      // Spotify
      const spotifyMatch = embedUrl.match(/open\.spotify\.com\/(episode|show)\/([a-zA-Z0-9]+)/);
      if (spotifyMatch) {
        html = `<div style="margin:1rem 0;"><iframe src="https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe></div>`;
        setContentType("podcast");
      } else {
        // Generic audio
        html = `<div style="margin:1rem 0;"><audio controls style="width:100%;" preload="metadata"><source src="${embedUrl}" /></audio></div>`;
        setContentType("podcast");
      }
    }

    if (html) {
      setContent(prev => prev + html);
      setEmbedUrl("");
      setEmbedOpen(false);
      toast({ title: `${embedType === "video" ? "Video" : "Audio"} embedded` });
    } else {
      toast({ title: "Invalid URL", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    await onSubmit({
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      featured_image: featuredImage,
      category_id: categoryId,
      content_type: contentType,
    });
    // Reset
    setTitle("");
    setContent("");
    setExcerpt("");
    setFeaturedImage("");
    setCategoryId("");
    setContentType("article");
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the headline?" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="article">📝 Article</SelectItem>
              <SelectItem value="video">🎥 Video</SelectItem>
              <SelectItem value="podcast">🎙 Podcast</SelectItem>
              <SelectItem value="gallery">🖼 Gallery</SelectItem>
              <SelectItem value="mixed">📦 Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Summary</Label>
        <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief description (optional)" className="mt-1" />
      </div>

      {/* Featured Image */}
      <div>
        <Label>Featured Image</Label>
        <div className="flex gap-2 mt-1 mb-2">
          <Button type="button" variant={imageMode === "upload" ? "secondary" : "ghost"} size="sm" onClick={() => setImageMode("upload")}>
            <Upload className="w-4 h-4 mr-1" />Upload
          </Button>
          <Button type="button" variant={imageMode === "url" ? "secondary" : "ghost"} size="sm" onClick={() => setImageMode("url")}>
            <Link className="w-4 h-4 mr-1" />URL
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
                <p className="text-sm text-muted-foreground">Click to upload (PNG, JPG up to 5MB)</p>
              </div>
            )}
          </div>
        ) : (
          <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." />
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "featured")} className="hidden" />
        {featuredImage && (
          <div className="relative mt-2">
            <img src={featuredImage} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setFeaturedImage("")}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content Editor with media buttons */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Content *</Label>
          <div className="flex gap-1">
            <label className="cursor-pointer">
              <input ref={contentImageRef} type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "content")} className="hidden" />
              <Button type="button" variant="outline" size="sm" asChild>
                <span><Image className="w-4 h-4 mr-1" />Image</span>
              </Button>
            </label>
            <Button type="button" variant="outline" size="sm" onClick={() => { setEmbedType("video"); setEmbedOpen(true); }}>
              <Video className="w-4 h-4 mr-1" />Video
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setEmbedType("audio"); setEmbedOpen(true); }}>
              <Headphones className="w-4 h-4 mr-1" />Audio
            </Button>
          </div>
        </div>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your post content..."
        />
      </div>

      {/* Embed Dialog */}
      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {embedType === "video" ? "Embed Video" : "Embed Audio / Podcast"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {embedType === "video"
                ? "Paste a YouTube, Vimeo, or direct video URL"
                : "Paste a Spotify, Apple Podcast, or direct MP3 URL"}
            </p>
            <Input
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder={embedType === "video" ? "https://youtube.com/watch?v=..." : "https://open.spotify.com/episode/..."}
            />
            <Button variant="hero" onClick={insertEmbed} disabled={!embedUrl.trim()} className="w-full">
              Insert {embedType === "video" ? "Video" : "Audio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 pt-4">
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex-1"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit for Review
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Your post will be reviewed by our team before publishing
      </p>
    </div>
  );
};

export default RichPostEditor;
