import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  priceRange: string;
  onPriceRangeChange: (v: string) => void;
  brand: string;
  onBrandChange: (v: string) => void;
  brands: string[];
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "solar_panels", label: "Solar Solutions" },
  { value: "batteries", label: "Energy Accessories" },
  { value: "inverters", label: "Inverters" },
  { value: "ev_chargers", label: "Electric Vehicles" },
  { value: "smart_devices", label: "Smart Tech" },
  { value: "accessories", label: "Clean Cooking" },
  { value: "bundles", label: "Bundles & Packages" },
];

const priceRanges = [
  { value: "", label: "Any Price" },
  { value: "0-100000", label: "Under ₦100,000" },
  { value: "100000-500000", label: "₦100k – ₦500k" },
  { value: "500000-1000000", label: "₦500k – ₦1M" },
  { value: "1000000-5000000", label: "₦1M – ₦5M" },
  { value: "5000000-999999999", label: "Above ₦5M" },
];

const ProductFilters = ({
  search, onSearchChange,
  category, onCategoryChange,
  priceRange, onPriceRangeChange,
  brand, onBrandChange,
  brands,
}: ProductFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = category || priceRange || brand;

  const clearAll = () => {
    onSearchChange("");
    onCategoryChange("");
    onPriceRangeChange("");
    onBrandChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={`space-y-4 rounded-xl border border-border/50 bg-card p-4 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-primary hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        {/* Category */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
          <div className="space-y-1">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => onCategoryChange(c.value || "all")}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                  (category === c.value) || (category === "all" && c.value === "")
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Price Range</Label>
          <Select value={priceRange || "any"} onValueChange={(v) => onPriceRangeChange(v === "any" ? "" : v)}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Any Price" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((p) => (
                <SelectItem key={p.value || "any"} value={p.value || "any"}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        {brands.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Brand</Label>
            <Select value={brand || "all"} onValueChange={(v) => onBrandChange(v === "all" ? "" : v)}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Availability */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Availability</Label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox defaultChecked disabled />
              In Stock
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
