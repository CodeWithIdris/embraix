import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Search,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];
type ProviderStatus = Database["public"]["Enums"]["provider_status"];

const STATUS_OPTIONS: { value: ProviderStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "pending", label: "Pending", icon: <Clock className="w-3 h-3" />, color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" },
  { value: "active", label: "Active", icon: <CheckCircle className="w-3 h-3" />, color: "bg-green-500/20 text-green-600 border-green-500/30" },
  { value: "suspended", label: "Suspended", icon: <XCircle className="w-3 h-3" />, color: "bg-red-500/20 text-red-600 border-red-500/30" },
  { value: "expired", label: "Expired", icon: <AlertCircle className="w-3 h-3" />, color: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
];

const ProvidersManager = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadProviders = async () => {
    setLoading(true);
    try {
      // Use service role to get all providers regardless of status
      let query = supabase
        .from("service_providers")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setProviders(data || []);
    } catch (error: any) {
      console.error("Error loading providers:", error);
      toast({
        title: "Error",
        description: "Failed to load providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleStatusChange = async (providerId: string, newStatus: ProviderStatus) => {
    setUpdating(true);
    try {
      const provider = providers.find(p => p.id === providerId);
      const previousStatus = provider?.status;
      
      const { error } = await supabase
        .from("service_providers")
        .update({ status: newStatus })
        .eq("id", providerId);

      if (error) throw error;

      setProviders(providers.map(p => 
        p.id === providerId ? { ...p, status: newStatus } : p
      ));

      if (selectedProvider?.id === providerId) {
        setSelectedProvider({ ...selectedProvider, status: newStatus });
      }

      // Send email notification for status changes
      if (provider && previousStatus !== newStatus) {
        const baseUrl = window.location.origin;
        
        if (newStatus === "active" && previousStatus !== "active") {
          // Provider approved
          supabase.functions.invoke("send-notification-email", {
            body: {
              type: "provider_approved",
              recipientEmail: provider.email,
              recipientName: provider.business_name,
              data: {
                businessName: provider.business_name,
                dashboardUrl: `${baseUrl}/centre/dashboard`,
              },
            },
          }).catch(err => console.error("Failed to send approval email:", err));
        } else if (newStatus === "suspended") {
          // Provider suspended
          supabase.functions.invoke("send-notification-email", {
            body: {
              type: "provider_suspended",
              recipientEmail: provider.email,
              recipientName: provider.business_name,
              data: {
                businessName: provider.business_name,
              },
            },
          }).catch(err => console.error("Failed to send suspension email:", err));
        }
      }

      toast({
        title: "Status Updated",
        description: `Provider status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyToggle = async (providerId: string, isVerified: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("service_providers")
        .update({ is_verified: !isVerified })
        .eq("id", providerId);

      if (error) throw error;

      setProviders(providers.map(p => 
        p.id === providerId ? { ...p, is_verified: !isVerified } : p
      ));

      if (selectedProvider?.id === providerId) {
        setSelectedProvider({ ...selectedProvider, is_verified: !isVerified });
      }

      toast({
        title: isVerified ? "Verification Removed" : "Provider Verified",
        description: isVerified 
          ? "Provider verification badge removed" 
          : "Provider has been verified",
      });
    } catch (error: any) {
      console.error("Error updating verification:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || provider.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProviderStatus) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusOption) return null;
    
    return (
      <Badge className={statusOption.color}>
        {statusOption.icon}
        <span className="ml-1 capitalize">{statusOption.label}</span>
      </Badge>
    );
  };

  const stats = {
    total: providers.length,
    pending: providers.filter(p => p.status === "pending").length,
    active: providers.filter(p => p.status === "active").length,
    suspended: providers.filter(p => p.status === "suspended").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-border/50">
          <CardContent className="pt-6">
            <Building2 className="w-6 h-6 text-primary mb-2" />
            <p className="font-display text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Providers</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="pt-6">
            <Clock className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="font-display text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="pt-6">
            <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
            <p className="font-display text-2xl font-bold">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="gradient-card border-border/50">
          <CardContent className="pt-6">
            <XCircle className="w-6 h-6 text-red-500 mb-2" />
            <p className="font-display text-2xl font-bold">{stats.suspended}</p>
            <p className="text-sm text-muted-foreground">Suspended</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Providers List */}
      {filteredProviders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No providers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="gradient-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {provider.logo_url ? (
                    <img
                      src={provider.logo_url}
                      alt={provider.business_name}
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-display">{provider.business_name}</CardTitle>
                      {provider.is_verified && (
                        <Badge className="bg-primary text-primary-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setDetailsOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{provider.business_type}</span>
                  {provider.city && <span>📍 {provider.city}, {provider.state}</span>}
                  <span>⭐ {Number(provider.rating).toFixed(1)} ({provider.review_count} reviews)</span>
                  <span>Joined {format(new Date(provider.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.categories.map((cat, index) => (
                    <Badge key={index} variant="secondary" className="capitalize text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Provider Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  {selectedProvider.business_name}
                  {selectedProvider.is_verified && (
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Manage provider details and status
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Logo & Cover */}
                <div className="flex gap-4">
                  {selectedProvider.logo_url ? (
                    <img
                      src={selectedProvider.logo_url}
                      alt="Logo"
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {selectedProvider.cover_image && (
                    <img
                      src={selectedProvider.cover_image}
                      alt="Cover"
                      className="flex-1 h-20 rounded-lg object-cover border border-border"
                    />
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={selectedProvider.status}
                      onValueChange={(value) => handleStatusChange(selectedProvider.id, value as ProviderStatus)}
                      disabled={updating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              {status.icon}
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant={selectedProvider.is_verified ? "destructive" : "hero"}
                      onClick={() => handleVerifyToggle(selectedProvider.id, selectedProvider.is_verified || false)}
                      disabled={updating}
                    >
                      {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {selectedProvider.is_verified ? "Remove Verification" : "Verify Provider"}
                    </Button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Business Type</label>
                    <p className="font-medium capitalize">{selectedProvider.business_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Rating</label>
                    <p className="font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary" />
                      {Number(selectedProvider.rating).toFixed(1)} ({selectedProvider.review_count} reviews)
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <h4 className="font-medium">Contact Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedProvider.email}`} className="text-primary hover:underline">
                        {selectedProvider.email}
                      </a>
                    </div>
                    {selectedProvider.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${selectedProvider.phone}`} className="text-primary hover:underline">
                          {selectedProvider.phone}
                        </a>
                      </div>
                    )}
                    {selectedProvider.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {selectedProvider.website}
                        </a>
                      </div>
                    )}
                    {selectedProvider.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {selectedProvider.address}, {selectedProvider.city}, {selectedProvider.state}, {selectedProvider.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedProvider.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProvider.description}
                    </p>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.categories.map((cat, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Subscription Info */}
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Subscription</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-muted-foreground">Paystack Customer ID</label>
                      <p>{selectedProvider.paystack_customer_id || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Subscription Code</label>
                      <p>{selectedProvider.paystack_subscription_code || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Expires At</label>
                      <p>
                        {selectedProvider.subscription_expires_at
                          ? format(new Date(selectedProvider.subscription_expires_at), "PPP")
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Created</label>
                      <p>{format(new Date(selectedProvider.created_at), "PPP")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProvidersManager;
