import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ServiceListing = Database["public"]["Tables"]["service_listings"]["Row"];

interface ListingCardProps {
  listing: ServiceListing;
  providerName?: string;
}

const ListingCard = ({ listing, providerName }: ListingCardProps) => {
  const navigate = useNavigate();

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      consultation: "💬",
      installation: "🔧",
      repair: "🛠️",
      sales: "🛒",
      maintenance: "⚙️",
      training: "📚",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  return (
    <Card className="gradient-card border-border/50 hover:shadow-elevated transition-all duration-300 group overflow-hidden">
      {listing.images && listing.images.length > 0 && (
        <div className="h-40 overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCategoryIcon(listing.category)}</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {listing.category}
              </Badge>
              {listing.is_featured && (
                <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
              )}
            </div>
            <CardTitle className="font-display text-lg group-hover:text-primary transition-colors line-clamp-1">
              {listing.title}
            </CardTitle>
          </div>
        </div>
        {providerName && (
          <p className="text-sm text-muted-foreground">by {providerName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

        {listing.price_range && (
          <div className="text-sm font-medium text-primary">{listing.price_range}</div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/centre/listing/${listing.id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
