import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { useStoreProducts } from "@/hooks/useStoreProducts";
import StoreProductCard from "@/components/store/StoreProductCard";
import ProductFilters from "@/components/store/ProductFilters";
import CompareFloatingBar from "@/components/store/CompareFloatingBar";
import QuickRecommendation from "@/components/store/QuickRecommendation";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StoreProducts = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [brand, setBrand] = useState("");

  const parsedPriceRange = useMemo(() => {
    if (!priceRange || priceRange === "any") return { min: undefined, max: undefined };
    const [min, max] = priceRange.split("-").map(Number);
    return { min, max };
  }, [priceRange]);

  const { data: products = [], isLoading } = useStoreProducts({
    category: category && category !== "all" ? category : undefined,
    minPrice: parsedPriceRange.min,
    maxPrice: parsedPriceRange.max,
    brand: brand && brand !== "all" ? brand : undefined,
    search: search || undefined,
  });

  const { data: allProducts = [] } = useStoreProducts();

  const brands = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort();
  }, [allProducts]);

  return (
    <>
      <Helmet>
        <title>Store Products | Embraix</title>
        <meta name="description" content="Browse and compare clean energy products — solar panels, batteries, inverters, EV chargers and more." />
      </Helmet>
      <Header />

      <div className="min-h-screen pt-20 pb-24 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <ShoppingBag className="w-6 h-6 inline-block mr-2 text-primary" />
                Embraix <span className="text-gradient">Store</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse, compare, and find the perfect energy solution.
              </p>
            </div>
            <Button
              variant="glass"
              size="sm"
              className="gap-1.5 hidden md:flex"
              onClick={() =>
                navigate("/chat", {
                  state: { starterMessage: "Help me choose the right solar system." },
                })
              }
            >
              <MessageCircle className="w-4 h-4" />
              Ask Embraix AI
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-72 shrink-0 space-y-4">
              <ProductFilters
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                brand={brand}
                onBrandChange={setBrand}
                brands={brands}
              />
              <QuickRecommendation products={allProducts} />
            </aside>

            {/* Product grid */}
            <main className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">No products found matching your filters.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setPriceRange("");
                      setBrand("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    {products.length} product{products.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <StoreProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      <CompareFloatingBar />
      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default StoreProducts;
