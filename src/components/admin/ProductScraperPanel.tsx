import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Result {
  url: string;
  status: "saved" | "duplicate" | "failed";
  productId?: string;
  name?: string;
  error?: string;
}

const ProductScraperPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [urlsText, setUrlsText] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [progress, setProgress] = useState(0);

  const handleScrape = async () => {
    const urls = urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http"));
    if (urls.length === 0) {
      toast({ title: "Add at least one URL", variant: "destructive" });
      return;
    }
    if (urls.length > 20) {
      toast({ title: "Max 20 URLs at a time", variant: "destructive" });
      return;
    }

    setRunning(true);
    setResults([]);
    setProgress(10);

    try {
      const { data, error } = await supabase.functions.invoke("scrape-product", {
        body: { urls },
      });
      if (error) throw error;
      setResults(data?.results || []);
      setProgress(100);
      const saved = (data?.results || []).filter((r: Result) => r.status === "saved").length;
      toast({
        title: "Scraping complete",
        description: `${saved} new product${saved === 1 ? "" : "s"} saved as draft.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
    } catch (err: any) {
      toast({ title: "Scrape failed", description: err.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-4 h-4 text-primary" />
          Bulk Product Scraper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Paste manufacturer or distributor product URLs (one per line). All scraped products are saved as
          drafts for review.
        </p>
        <Textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder="https://manufacturer.com/product-1&#10;https://distributor.com/product-2"
          rows={5}
          disabled={running}
          className="font-mono text-xs"
        />
        <div className="flex items-center justify-between gap-3">
          <Button onClick={handleScrape} disabled={running} className="gap-1.5">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {running ? "Scraping…" : "Scrape & Save as Draft"}
          </Button>
          {running && <Progress value={progress} className="flex-1 h-2" />}
        </div>

        {results.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <p className="text-xs font-medium">Results</p>
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/30"
              >
                {r.status === "saved" && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                {r.status === "duplicate" && <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                {r.status === "failed" && <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
                <span className="flex-1 truncate">{r.name || r.url}</span>
                <Badge variant="outline" className="text-[10px]">
                  {r.status}
                </Badge>
                {r.error && <span className="text-destructive text-[10px] truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductScraperPanel;
