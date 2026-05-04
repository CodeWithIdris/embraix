import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Edit, Trash2, Loader2, Package, Upload, X, CheckCircle2, Send, Ban, Eye,
} from "lucide-react";
import { formatPrice } from "@/components/store/StoreProductCard";
import ProductScraperPanel from "./ProductScraperPanel";

const categories = [
  { value: "solar_panels", label: "Solar Panels" },
  { value: "batteries", label: "Batteries" },
  { value: "inverters", label: "Inverters" },
  { value: "ev_chargers", label: "EV Chargers" },
  { value: "smart_devices", label: "Smart Devices" },
  { value: "accessories", label: "Accessories" },
  { value: "bundles", label: "Bundles" },
  { value: "clean_cooking", label: "Clean Cooking" },
];

const STATUSES = ["all", "draft", "approved", "published", "rejected"] as const;
type StatusFilter = typeof STATUSES[number];

interface ProductForm {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  brand: string;
  model: string;
  manufacturer_price: string;
  markup_percent: string;
  price: string;
  currency: string;
  power_capacity: string;
  battery_capacity: string;
  system_type: string;
  warranty_years: string;
  installation_required: boolean;
  best_for: string;
  recommended_usage: string;
  features: string;
  tags: string;
  sku: string;
  stock_quantity: string;
  is_featured: boolean;
  is_active: boolean;
}

const emptyForm: ProductForm = {
  name: "", slug: "", short_description: "", description: "", category: "solar_panels", brand: "", model: "",
  manufacturer_price: "0", markup_percent: "12", price: "0", currency: "NGN",
  power_capacity: "", battery_capacity: "", system_type: "", warranty_years: "",
  installation_required: true, best_for: "", recommended_usage: "", features: "", tags: "",
  sku: "", stock_quantity: "0", is_featured: false, is_active: true,
};

const StoreProductsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-store-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    const c = { total: products.length, draft: 0, approved: 0, published: 0, rejected: 0 };
    products.forEach((p: any) => {
      if (p.status === "draft") c.draft++;
      else if (p.status === "approved") c.approved++;
      else if (p.status === "published") c.published++;
      else if (p.status === "rejected") c.rejected++;
    });
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return products;
    return products.filter((p: any) => p.status === statusFilter);
  }, [products, statusFilter]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || "",
      description: product.description || "",
      category: product.category,
      brand: product.brand || "",
      model: product.model || "",
      manufacturer_price: String(product.manufacturer_price ?? ""),
      markup_percent: String(product.markup_percent ?? 12),
      price: String(product.price),
      currency: product.currency || "NGN",
      power_capacity: product.power_capacity || "",
      battery_capacity: product.battery_capacity || "",
      system_type: product.system_type || "",
      warranty_years: product.warranty_years ? String(product.warranty_years) : "",
      installation_required: product.installation_required ?? true,
      best_for: product.best_for || "",
      recommended_usage: product.recommended_usage || "",
      features: (product.features || []).join(", "),
      tags: (product.tags || []).join(", "),
      sku: product.sku || "",
      stock_quantity: String(product.stock_quantity || 0),
      is_featured: product.is_featured ?? false,
      is_active: product.is_active ?? true,
    });
    setImages(product.images || []);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const newImages: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        newImages.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...newImages]);
      toast({ title: "Images uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  // Live computed final price
  const computedPrice = useMemo(() => {
    const mp = Number(form.manufacturer_price) || 0;
    const mk = Number(form.markup_percent) || 0;
    if (mp > 0) return mp * (1 + mk / 100);
    return Number(form.price) || 0;
  }, [form.manufacturer_price, form.markup_percent, form.price]);

  const handleSave = async () => {
    if (!form.name || !form.category) {
      toast({ title: "Missing fields", description: "Name and category are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const finalPrice = Number(form.price) > 0 ? Number(form.price) : computedPrice;
      const payload: any = {
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        short_description: form.short_description || null,
        description: form.description || null,
        category: form.category as any,
        brand: form.brand || null,
        model: form.model || null,
        manufacturer_price: form.manufacturer_price ? Number(form.manufacturer_price) : null,
        markup_percent: Number(form.markup_percent) || 12,
        price: finalPrice,
        currency: form.currency || "NGN",
        power_capacity: form.power_capacity || null,
        battery_capacity: form.battery_capacity || null,
        system_type: form.system_type || null,
        warranty_years: form.warranty_years ? Number(form.warranty_years) : null,
        installation_required: form.installation_required,
        best_for: form.best_for || null,
        recommended_usage: form.recommended_usage || null,
        features: form.features ? form.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        sku: form.sku || null,
        stock_quantity: Number(form.stock_quantity) || 0,
        is_featured: form.is_featured,
        is_active: form.is_active,
        images,
      };

      if (editingId) {
        const { error } = await supabase.from("store_products").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Product updated" });
      } else {
        const { error } = await supabase.from("store_products").insert({ ...payload, status: "draft", source: "manual" });
        if (error) throw error;
        toast({ title: "Product created as draft" });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string, alsoActivate = false) => {
    const update: any = { status };
    if (alsoActivate) update.is_active = true;
    if (status === "rejected") update.is_active = false;
    const { error } = await supabase.from("store_products").update(update).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Marked as ${status}` });
    queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
    queryClient.invalidateQueries({ queryKey: ["store-products"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("store_products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Product deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
    queryClient.invalidateQueries({ queryKey: ["store-products"] });
  };

  const set = (field: keyof ProductForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      approved: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
      published: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
      rejected: "bg-destructive/10 text-destructive border-destructive/30",
    };
    return <Badge variant="outline" className={`text-xs ${variants[status] || ""}`}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Store Products</h2>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Total", value: stats.total },
          { label: "Draft", value: stats.draft },
          { label: "Approved", value: stats.approved },
          { label: "Published", value: stats.published },
          { label: "Rejected", value: stats.rejected },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProductScraperPanel />

      {/* Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent><Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No products in this view.</p></CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((product: any) => (
            <Card key={product.id} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-medium truncate">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                      {statusBadge(product.status || "draft")}
                      <span className="text-xs font-medium text-foreground">{formatPrice(product.price, product.currency)}</span>
                      {product.source && product.source !== "manual" && (
                        <Badge variant="outline" className="text-[10px]">via {product.source}</Badge>
                      )}
                      {product.is_featured && <Badge className="text-xs">Featured</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {product.status === "draft" && (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600" onClick={() => updateStatus(product.id, "approved")} title="Approve">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Approve</span>
                    </Button>
                  )}
                  {product.status === "approved" && (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-green-600" onClick={() => updateStatus(product.id, "published", true)} title="Publish">
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Publish</span>
                    </Button>
                  )}
                  {product.status === "published" && (
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => updateStatus(product.id, "approved")} title="Unpublish">
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Unpublish</span>
                    </Button>
                  )}
                  {(product.status === "draft" || product.status === "approved") && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateStatus(product.id, "rejected")} title="Reject">
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => { set("name", e.target.value); if (!editingId) set("slug", generateSlug(e.target.value)); }} />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Short description</Label>
              <Input value={form.short_description} onChange={(e) => set("short_description", e.target.value)} placeholder="One-line summary for cards" />
            </div>

            <div className="space-y-1.5">
              <Label>Full description</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Model</Label>
                <Input value={form.model} onChange={(e) => set("model", e.target.value)} />
              </div>
            </div>

            {/* Pricing */}
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="p-3 space-y-3">
                <p className="text-xs font-medium">Pricing</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Manufacturer price</Label>
                    <Input type="number" value={form.manufacturer_price} onChange={(e) => set("manufacturer_price", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Markup %</Label>
                    <Input type="number" value={form.markup_percent} onChange={(e) => set("markup_percent", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Final price (override)</Label>
                    <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder={String(computedPrice.toFixed(2))} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Computed: {form.currency} {computedPrice.toFixed(2)} (manufacturer × {1 + (Number(form.markup_percent) || 0) / 100}). Leave Final price empty to auto-apply.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input value={form.currency} onChange={(e) => set("currency", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Stock</Label>
                <Input type="number" value={form.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Power Capacity</Label>
                <Input value={form.power_capacity} onChange={(e) => set("power_capacity", e.target.value)} placeholder="e.g., 5kW" />
              </div>
              <div className="space-y-1.5">
                <Label>Battery Capacity</Label>
                <Input value={form.battery_capacity} onChange={(e) => set("battery_capacity", e.target.value)} placeholder="e.g., 10kWh" />
              </div>
              <div className="space-y-1.5">
                <Label>Warranty (years)</Label>
                <Input type="number" value={form.warranty_years} onChange={(e) => set("warranty_years", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>System Type</Label>
                <Input value={form.system_type} onChange={(e) => set("system_type", e.target.value)} placeholder="e.g., Hybrid" />
              </div>
              <div className="space-y-1.5">
                <Label>Best For</Label>
                <Input value={form.best_for} onChange={(e) => set("best_for", e.target.value)} placeholder="e.g., Small homes" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Recommended Usage</Label>
              <Input value={form.recommended_usage} onChange={(e) => set("recommended_usage", e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Features (comma-separated)</Label>
              <Textarea value={form.features} onChange={(e) => set("features", e.target.value)} rows={2} placeholder="MPPT tracking, WiFi monitoring, IP65 rated" />
            </div>

            <div className="space-y-1.5">
              <Label>Tags (comma-separated, used for search & AI)</Label>
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="solar, inverter, hybrid, smart-home" />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-0.5">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.installation_required} onCheckedChange={(v) => set("installation_required", v)} />
                <Label>Installation Required</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                {editingId ? "Update Product" : "Create as Draft"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreProductsManager;
