import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import RichTextEditor from "@/components/blog/RichTextEditor";
import DOMPurify from "dompurify";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Loader2, Image, Upload, Link, X, Video, Headphones,
  ChevronDown, CalendarIcon, Search, Eye, Send, Clock
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
    subtitle?: string;
    scheduled_at?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  }) => Promise<void>;
  submitting: boolean;
  initialData?: {
    title?: string;
    content?: string;
    excerpt?: string;
    featured_image?: string;
    category_id?: string;
    subtitle?: string;
    scheduled_at?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
  };
}

const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'audio', 'video', 'source', 'figure', 'figcaption'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'controls', 'preload', 'loading', 'style'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'form', 'input', 'object', 'embed'],
};

const RichPostEditor = ({ categories, onSubmit, submitting, initialData }: RichPostEditorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [contentType, setContentType] = useState("article");
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

  // SEO
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [keywordsInput, setKeywordsInput] = useState(initialData?.keywords?.join(", ") || "");
  const [seoOpen, setSeoOpen] = useState(false);

  // Scheduling
  const [publishMode, setPublishMode] = useState<"now" | "schedule">(initialData?.scheduled_at ? "schedule" : "now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    initialData?.scheduled_at ? new Date(initialData.scheduled_at) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.scheduled_at ? format(new Date(initialData.scheduled_at), "HH:mm") : "08:00"
  );

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Embed dialog
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedType, setEmbedType] = useState<"video" | "audio">("video");
  const [embedUrl, setEmbedUrl] = useState("");

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
      const ytMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) {
        html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:1rem 0;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe></div>`;
        setContentType("video");
      }
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
      const spotifyMatch = embedUrl.match(/open\.spotify\.com\/(episode|show)\/([a-zA-Z0-9]+)/);
      if (spotifyMatch) {
        html = `<div style="margin:1rem 0;"><iframe src="https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px;"></iframe></div>`;
        setContentType("podcast");
      } else {
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

    let scheduled_at: string | undefined;
    if (publishMode === "schedule" && scheduledDate) {
      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const dt = new Date(scheduledDate);
      dt.setHours(hours, minutes, 0, 0);
      scheduled_at = dt.toISOString();
    }

    const keywords = keywordsInput.split(",").map(k => k.trim()).filter(Boolean);

    await onSubmit({
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      featured_image: featuredImage,
      category_id: categoryId,
      content_type: contentType,
      subtitle: subtitle.trim() || undefined,
      scheduled_at,
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      keywords: keywords.length ? keywords : undefined,
    });

    // Reset
    setTitle(""); setSubtitle(""); setContent(""); setExcerpt("");
    setFeaturedImage(""); setCategoryId(""); setContentType("article");
    setMetaTitle(""); setMetaDescription(""); setKeywordsInput("");
    setPublishMode("now"); setScheduledDate(undefined);
  };

  return (
    <div className="space-y-4 py-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="editor" className="gap-2"><Send className="w-4 h-4" />Editor</TabsTrigger>
          <TabsTrigger value="preview" className="gap-2"><Eye className="w-4 h-4" />Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          {/* Title */}
          <div>
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's the headline?" className="mt-1 text-lg font-semibold" />
          </div>

          {/* Subtitle */}
          <div>
            <Label>Subtitle <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="A brief subtitle..." className="mt-1" />
          </div>

          {/* Auto-generated slug preview */}
          {title && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link className="w-3 h-3" />
              <span>/media/news/{generateSlug(title)}</span>
            </div>
          )}

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
                    <p className="text-sm text-muted-foreground">Click or drag to upload (PNG, JPG up to 5MB)</p>
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
              placeholder="Write your article content... Add headings, images, videos, and more."
            />
          </div>

          {/* SEO Fields (Collapsible) */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />SEO Settings
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", seoOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Meta Title <span className="text-muted-foreground">({metaTitle.length}/60)</span></Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value.slice(0, 60))} placeholder="SEO title (defaults to article title)" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Meta Description <span className="text-muted-foreground">({metaDescription.length}/160)</span></Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value.slice(0, 160))} placeholder="Brief SEO description..." className="mt-1" rows={2} />
              </div>
              <div>
                <Label className="text-xs">Keywords <span className="text-muted-foreground">(comma-separated)</span></Label>
                <Input value={keywordsInput} onChange={(e) => setKeywordsInput(e.target.value)} placeholder="solar energy, renewable, africa..." className="mt-1" />
                {keywordsInput && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {keywordsInput.split(",").map((k, i) => k.trim() && (
                      <Badge key={i} variant="secondary" className="text-xs">{k.trim()}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Scheduling */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Publishing
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={publishMode === "now" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPublishMode("now")}
              >
                Publish Now
              </Button>
              <Button
                type="button"
                variant={publishMode === "schedule" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPublishMode("schedule")}
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
            {publishMode === "schedule" && (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal mt-1", !scheduledDate && "text-muted-foreground")}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-28">
                  <Label className="text-xs">Time</Label>
                  <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="mt-1" />
                </div>
              </div>
            )}
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
              {publishMode === "schedule" && scheduledDate
                ? `Submit (Scheduled: ${format(scheduledDate, "MMM d")})`
                : "Submit for Review"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Your post will be reviewed by our team before publishing
          </p>
        </TabsContent>

        <TabsContent value="preview">
          <div className="border border-border rounded-lg p-6 bg-background min-h-[400px]">
            {!title && !content ? (
              <div className="text-center text-muted-foreground py-12">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start writing to see a preview</p>
              </div>
            ) : (
              <article>
                {featuredImage && (
                  <img src={featuredImage} alt={title} className="w-full h-auto rounded-lg mb-6 max-h-80 object-cover" />
                )}
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h1>
                {subtitle && <p className="text-lg text-muted-foreground mb-4">{subtitle}</p>}
                {excerpt && <p className="text-sm text-muted-foreground italic mb-6 border-l-2 border-primary pl-3">{excerpt}</p>}
                <div
                  className="prose dark:prose-invert max-w-none text-foreground/90
                    prose-headings:text-foreground prose-headings:font-display
                    prose-p:mb-4 prose-a:text-primary prose-a:underline
                    prose-img:rounded-lg prose-img:max-w-full
                    [&_figure]:my-4 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground
                    [&_iframe]:w-full [&_iframe]:rounded-lg
                    [&_video]:w-full [&_video]:rounded-lg
                    [&_audio]:w-full"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, sanitizeConfig) }}
                />
              </article>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RichPostEditor;
