import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ServiceProvider = Database["public"]["Tables"]["service_providers"]["Row"];

interface ServiceCardProps {
  provider: ServiceProvider;
}

const ServiceCard = ({ provider }: ServiceCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="gradient-card border-border/50 hover:shadow-elevated transition-all duration-300 group overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/10">
        {provider.cover_image && (
          <img
            src={provider.cover_image}
            alt={provider.business_name}
            className="w-full h-full object-cover"
          />
        )}
        {provider.logo_url && (
          <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl border-4 border-background bg-background overflow-hidden shadow-card">
            <img
              src={provider.logo_url}
              alt={provider.business_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {provider.is_verified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary text-primary-foreground gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pt-10 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-display text-lg group-hover:text-primary transition-colors">
              {provider.business_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{provider.business_type}</p>
          </div>
          {provider.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-medium">{Number(provider.rating).toFixed(1)}</span>
              <span className="text-muted-foreground">({provider.review_count})</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {provider.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {provider.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary" className="text-xs capitalize">
              {category}
            </Badge>
          ))}
          {provider.categories.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{provider.categories.length - 3}
            </Badge>
          )}
        </div>

        {(provider.city || provider.state) && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>
              {[provider.city, provider.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        <Button
          variant="hero"
          className="w-full"
          onClick={() => navigate(`/centre/provider/${provider.id}`)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
