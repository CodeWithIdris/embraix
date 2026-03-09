import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Newspaper, 
  ShoppingBag, 
  FileText, 
  Users, 
  BookOpen,
  Loader2,
  ArrowRight,
  Command
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  type: "news" | "product" | "report" | "expert" | "case_study";
  href: string;
  excerpt?: string;
}

const typeConfig = {
  news: { icon: Newspaper, label: "News", color: "bg-blue-500/10 text-blue-600" },
  product: { icon: ShoppingBag, label: "Product", color: "bg-green-500/10 text-green-600" },
  report: { icon: FileText, label: "Report", color: "bg-orange-500/10 text-orange-600" },
  expert: { icon: Users, label: "Expert", color: "bg-purple-500/10 text-purple-600" },
  case_study: { icon: BookOpen, label: "Case Study", color: "bg-cyan-500/10 text-cyan-600" },
};

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const stored = localStorage.getItem("embraix_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search news posts
      const { data: news } = await supabase
        .from("news_posts")
        .select("id, title, excerpt")
        .eq("status", "approved")
        .ilike("title", `%${searchQuery}%`)
        .limit(3);

      if (news) {
        searchResults.push(...news.map(n => ({
          id: n.id,
          title: n.title,
          type: "news" as const,
          href: `/news/${n.id}`,
          excerpt: n.excerpt || undefined,
        })));
      }

      // Search products
      const { data: products } = await supabase
        .from("store_products")
        .select("id, name, slug, description")
        .eq("is_active", true)
        .ilike("name", `%${searchQuery}%`)
        .limit(3);

      if (products) {
        searchResults.push(...products.map(p => ({
          id: p.id,
          title: p.name,
          type: "product" as const,
          href: `/store/product/${p.slug}`,
          excerpt: p.description?.slice(0, 100) || undefined,
        })));
      }

      // Search case studies
      const { data: caseStudies } = await supabase
        .from("case_studies")
        .select("id, title, slug, excerpt")
        .eq("status", "published")
        .ilike("title", `%${searchQuery}%`)
        .limit(3);

      if (caseStudies) {
        searchResults.push(...caseStudies.map(c => ({
          id: c.id,
          title: c.title,
          type: "case_study" as const,
          href: `/media/story/${c.slug}`,
          excerpt: c.excerpt || undefined,
        })));
      }

      // Search expert profiles
      const { data: experts } = await supabase
        .from("expert_profiles")
        .select("id, full_name, professional_title")
        .eq("status", "active")
        .eq("is_available", true)
        .ilike("full_name", `%${searchQuery}%`)
        .limit(3);

      if (experts) {
        searchResults.push(...experts.map(e => ({
          id: e.id,
          title: e.full_name,
          type: "expert" as const,
          href: `/expert/${e.id}`,
          excerpt: e.professional_title || undefined,
        })));
      }

      // Search research submissions
      const { data: research } = await supabase
        .from("research_submissions")
        .select("id, title, abstract")
        .eq("status", "approved")
        .ilike("title", `%${searchQuery}%`)
        .limit(2);

      if (research) {
        searchResults.push(...research.map(r => ({
          id: r.id,
          title: r.title,
          type: "report" as const,
          href: `/insight/research`,
          excerpt: r.abstract?.slice(0, 100) || undefined,
        })));
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem("embraix_recent_searches", JSON.stringify(updated));
    
    onClose();
    setQuery("");
    navigate(result.href);
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    performSearch(search);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Embraix</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center border-b px-4">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, products, experts, reports..."
            className="border-0 focus-visible:ring-0 text-base h-14"
          />
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {config.label}
                        </Badge>
                      </div>
                      {result.excerpt && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-2">
                    Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentClick(search)}
                        className="text-xs h-7"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 px-2">
                Quick Links
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Latest News", href: "/media", icon: Newspaper },
                  { label: "Products", href: "/store", icon: ShoppingBag },
                  { label: "Experts", href: "/centre/experts", icon: Users },
                  { label: "Reports", href: "/insight", icon: FileText },
                ].map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    size="sm"
                    onClick={() => { onClose(); navigate(link.href); }}
                    className="justify-start gap-2 h-9"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">esc</kbd>
              to close
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">K</kbd>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Search trigger button component
export const SearchTrigger = ({ onClick }: { onClick: () => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClick]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="hidden md:flex items-center gap-2 text-muted-foreground h-9 px-3 w-[200px] justify-start"
    >
      <Search className="w-4 h-4" />
      <span className="text-sm">Search...</span>
      <kbd className="ml-auto text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
    </Button>
  );
};
