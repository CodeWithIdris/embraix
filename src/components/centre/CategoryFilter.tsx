import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/hooks/useServiceProviders";
import type { Database } from "@/integrations/supabase/types";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

interface CategoryFilterProps {
  selected: ServiceCategory | null;
  onSelect: (category: ServiceCategory | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        All Services
      </Button>
      {SERVICE_CATEGORIES.map((category) => (
        <Button
          key={category.value}
          variant={selected === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category.value)}
          className="rounded-full gap-1"
        >
          <span>{category.icon}</span>
          {category.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
