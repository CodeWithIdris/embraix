import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20",
  green: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20",
  purple: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20",
  orange: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20",
  gray: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  primary: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
};

const CategoryFilter = ({ selectedCategory, onSelect }: CategoryFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from("post_categories")
      .select("*")
      .order("name");
    
    if (data) setCategories(data);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant="outline"
        className={`cursor-pointer transition-colors ${
          selectedCategory === null 
            ? "bg-primary/10 text-primary border-primary" 
            : "hover:bg-secondary"
        }`}
        onClick={() => onSelect(null)}
      >
        All
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant="outline"
          className={`cursor-pointer transition-colors ${
            selectedCategory === category.id 
              ? colorMap[category.color] || colorMap.primary
              : "hover:bg-secondary"
          }`}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default CategoryFilter;
