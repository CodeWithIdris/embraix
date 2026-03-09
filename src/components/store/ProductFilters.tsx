import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
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
  { value: "solar_panels", label: "Solar Panels" },
  { value: "batteries", label: "Batteries" },
  { value: "inverters", label: "Inverters" },
  { value: "ev_chargers", label: "EV Chargers" },
  { value: "smart_devices", label: "Smart Devices" },
  { value: "accessories", label: "Accessories" },
  { value: "bundles", label: "Bundles" },
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

  return (
    <div className="space-y-3">
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
          className="md:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${showFilters ? "block" : "hidden md:grid"}`}>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value || "all"}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Price Range</Label>
          <Select value={priceRange} onValueChange={onPriceRangeChange}>
            <SelectTrigger><SelectValue placeholder="Any Price" /></SelectTrigger>
            <SelectContent>
              {priceRanges.map((p) => (
                <SelectItem key={p.value} value={p.value || "any"}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Brand</Label>
          <Select value={brand} onValueChange={onBrandChange}>
            <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
