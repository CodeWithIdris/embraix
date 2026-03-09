import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import { useCompare } from "@/contexts/CompareContext";
import { formatPrice } from "@/components/store/StoreProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, X, MessageCircle, CheckCircle2, XCircle } from "lucide-react";

type ComparisonRow = {
  label: string;
  key: string;
  format?: (v: any, p: any) => string;
  fallback?: string;
};

const comparisonRows: ComparisonRow[] = [
  { label: "Price", key: "price", format: (v: any, p: any) => formatPrice(v, p.currency) },
  { label: "Category", key: "category", format: (v: string) => v.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) },
  { label: "Brand", key: "brand", fallback: "—" },
  { label: "Power Capacity", key: "power_capacity", fallback: "—" },
  { label: "Battery Capacity", key: "battery_capacity", fallback: "—" },
  { label: "System Type", key: "system_type", fallback: "—" },
  { label: "Warranty", key: "warranty_years", format: (v: number | null) => v ? `${v} years` : "—" },
  { label: "Installation Required", key: "installation_required", format: (v: boolean | null) => v === true ? "Yes" : v === false ? "No" : "—" },
  { label: "Best For", key: "best_for", fallback: "—" },
  { label: "Recommended Usage", key: "recommended_usage", fallback: "—" },
];

const StoreCompare = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Compare Products | Embraix Store</title>
        <meta name="description" content="Compare clean energy products side by side on Embraix Store." />
      </Helmet>
      <Header />

      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/store/products")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold">
                Compare Products
              </h1>
              <p className="text-xs text-muted-foreground">
                {compareItems.length} product{compareItems.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            {compareItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCompare} className="ml-auto text-xs">
                Clear All
              </Button>
            )}
          </div>

          {compareItems.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-muted-foreground">
                Select at least 2 products to compare.
              </p>
              <Button onClick={() => navigate("/store/products")}>
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40 bg-secondary/30 sticky left-0 z-10">Feature</TableHead>
                    {compareItems.map((item) => (
                      <TableHead key={item.id} className="min-w-[200px] text-center">
                        <div className="space-y-1">
                          <p className="font-display font-semibold text-sm">{item.name}</p>
                          {item.brand && (
                            <p className="text-xs text-muted-foreground font-normal">{item.brand}</p>
                          )}
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-xs"
                          >
                            <X className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium text-sm bg-secondary/30 sticky left-0 z-10">
                        {row.label}
                      </TableCell>
                      {compareItems.map((item) => {
                        const value = (item as any)[row.key];
                        let display: React.ReactNode;

                        if (row.format) {
                          display = (row.format as any)(value, item);
                        } else {
                          display = value ?? (row as any).fallback ?? "—";
                        }

                        // Special rendering for booleans
                        if (row.key === "installation_required") {
                          display = value === true ? (
                            <span className="inline-flex items-center gap-1 text-yellow-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                            </span>
                          ) : value === false ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <XCircle className="w-3.5 h-3.5" /> No
                            </span>
                          ) : "—";
                        }

                        return (
                          <TableCell key={item.id} className="text-center text-sm">
                            {display}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* Features row */}
                  <TableRow>
                    <TableCell className="font-medium text-sm bg-secondary/30 sticky left-0 z-10">
                      Key Features
                    </TableCell>
                    {compareItems.map((item) => (
                      <TableCell key={item.id} className="text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {item.features?.slice(0, 4).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                              {f}
                            </Badge>
                          )) || "—"}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {/* AI assistance */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="glass"
              className="gap-2"
              onClick={() =>
                navigate("/chat", {
                  state: {
                    starterMessage: `Help me choose between these products: ${compareItems.map((p) => p.name).join(", ")}`,
                  },
                })
              }
            >
              <MessageCircle className="w-4 h-4" />
              Ask Embraix AI to Help You Decide
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      <FloatingAIConsult />
    </>
  );
};

export default StoreCompare;
