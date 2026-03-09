import React, { createContext, useContext, useState, useCallback } from "react";
import type { StoreProduct } from "@/hooks/useStoreProducts";
import { toast } from "sonner";

interface CompareContextType {
  compareItems: StoreProduct[];
  addToCompare: (product: StoreProduct) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: React.ReactNode }) => {
  const [compareItems, setCompareItems] = useState<StoreProduct[]>([]);

  const addToCompare = useCallback((product: StoreProduct) => {
    setCompareItems((prev) => {
      if (prev.length >= 4) {
        toast.error("Maximum 4 products can be compared");
        return prev;
      }
      if (prev.find((p) => p.id === product.id)) {
        toast.info("Product already in comparison");
        return prev;
      }
      toast.success(`${product.name} added to comparison`);
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => compareItems.some((p) => p.id === productId),
    [compareItems]
  );

  const clearCompare = useCallback(() => setCompareItems([]), []);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        compareCount: compareItems.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
