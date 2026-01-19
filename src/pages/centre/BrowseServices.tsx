import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ServiceCard from "@/components/centre/ServiceCard";
import CategoryFilter from "@/components/centre/CategoryFilter";
import { useServiceProviders } from "@/hooks/useServiceProviders";
import { Search, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

const BrowseServices = () => {
  const navigate = useNavigate();
  const { providers, providersLoading } = useServiceProviders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const filteredProviders = providers?.filter((provider) => {
    const matchesSearch =
      !searchQuery ||
      provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || provider.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Browse Services | Embraix Centre</title>
        <meta name="description" content="Browse and find trusted service providers on Embraix." />
      </Helmet>

      <Header />

      <div className="min-h-screen pt-20 pb-12 bg-background">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/centre")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Centre
          </Button>

          {/* Search Header */}
          <div className="py-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Browse Services
            </h1>
            <p className="text-muted-foreground mb-6">
              Find the right service provider for your needs
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search providers, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <CategoryFilter
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* Results */}
          {providersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="gradient-card border-border/50 animate-pulse">
                  <div className="h-32 bg-muted" />
                  <CardContent className="pt-10 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProviders && filteredProviders.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <ServiceCard key={provider.id} provider={provider} />
                ))}
              </div>
            </>
          ) : (
            <Card className="gradient-card border-border/50">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory
                    ? "No providers match your search criteria"
                    : "No providers available yet"}
                </p>
                {(searchQuery || selectedCategory) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default BrowseServices;
