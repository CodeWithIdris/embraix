import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Search, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  Bookmark,
  Bell,
  Inbox,
  Package,
  Newspaper,
  FileBarChart
} from "lucide-react";

interface EmptyStateProps {
  type?: "default" | "search" | "products" | "news" | "reports" | "messages" | "bookmarks" | "notifications" | "services" | "requests";
  title?: string;
  description?: string;
  icon?: ReactNode;
  suggestions?: Array<{ label: string; href: string }>;
  action?: { label: string; href: string };
}

const presets: Record<string, Omit<EmptyStateProps, "type">> = {
  default: {
    title: "Nothing here yet",
    description: "Content will appear here once available.",
    icon: <FileText className="w-12 h-12 text-muted-foreground/50" />,
  },
  search: {
    title: "No results found",
    description: "Try different keywords or browse our categories.",
    icon: <Search className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Browse News", href: "/media" },
      { label: "View Products", href: "/store" },
      { label: "Ask AI", href: "/chat" },
    ],
  },
  products: {
    title: "No products found",
    description: "Check back soon for new products or try a different filter.",
    icon: <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Solar Panels", href: "/store?category=solar_panels" },
      { label: "Batteries", href: "/store?category=batteries" },
      { label: "Inverters", href: "/store?category=inverters" },
    ],
  },
  news: {
    title: "No articles yet",
    description: "Stay tuned for the latest clean energy news and updates.",
    icon: <Newspaper className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Explore Insights", href: "/insight" },
      { label: "View Case Studies", href: "/media/stories" },
    ],
  },
  reports: {
    title: "No reports available",
    description: "Industry reports and analysis will appear here.",
    icon: <FileBarChart className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Browse Research", href: "/insight/research" },
      { label: "Read News", href: "/media" },
    ],
  },
  messages: {
    title: "No messages yet",
    description: "Start a conversation with service providers or experts.",
    icon: <MessageSquare className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Find Experts", href: "/centre/experts" },
      { label: "Browse Services", href: "/centre/services" },
    ],
  },
  bookmarks: {
    title: "No saved items",
    description: "Save articles, products, and reports to access them later.",
    icon: <Bookmark className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Browse Products", href: "/store" },
      { label: "Read Articles", href: "/media" },
    ],
  },
  notifications: {
    title: "All caught up!",
    description: "You have no new notifications.",
    icon: <Bell className="w-12 h-12 text-muted-foreground/50" />,
  },
  services: {
    title: "No services listed",
    description: "Service providers will appear here.",
    icon: <Users className="w-12 h-12 text-muted-foreground/50" />,
    suggestions: [
      { label: "Register as Provider", href: "/centre/provider/register" },
      { label: "Request a Service", href: "/centre/support" },
    ],
  },
  requests: {
    title: "No service requests yet",
    description: "Your service requests will appear here.",
    icon: <Package className="w-12 h-12 text-muted-foreground/50" />,
    action: { label: "Request a Service", href: "/centre/support" },
  },
};

export const EmptyState = ({ 
  type = "default", 
  title, 
  description, 
  icon, 
  suggestions, 
  action 
}: EmptyStateProps) => {
  const navigate = useNavigate();
  const preset = presets[type] || presets.default;
  
  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalIcon = icon || preset.icon;
  const finalSuggestions = suggestions || preset.suggestions;
  const finalAction = action || preset.action;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 rounded-full bg-muted/50">
        {finalIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {finalTitle}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {finalDescription}
      </p>

      {finalSuggestions && finalSuggestions.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Try these:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {finalSuggestions.map((suggestion) => (
              <Button
                key={suggestion.href}
                variant="outline"
                size="sm"
                onClick={() => navigate(suggestion.href)}
                className="text-xs"
              >
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {finalAction && (
        <Button onClick={() => navigate(finalAction.href)}>
          {finalAction.label}
        </Button>
      )}
    </div>
  );
};
