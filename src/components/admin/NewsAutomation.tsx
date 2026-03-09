import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Newspaper, Loader2, RefreshCw, Zap } from "lucide-react";

const NewsAutomation = () => {
  const { toast } = useToast();
  const [scraping, setScraping] = useState(false);
  const [lastResult, setLastResult] = useState<{ created: number; errors: number; totalFound: number } | null>(null);

  const handleScrape = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-news");

      if (error) throw error;

      setLastResult(data);

      if (data?.created > 0) {
        toast({ title: "News scraped!", description: `${data.created} new articles published` });
      } else {
        toast({ title: "No new articles", description: data?.message || "No unique news found this time" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to scrape news", variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const handleWeeklyNewsletter = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("send-weekly-newsletter");
      if (error) throw error;
      toast({
        title: "Newsletter sent!",
        description: `${data?.sent || 0} emails delivered`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send newsletter", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl font-bold">Automation</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              News Scraper
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fetch latest clean energy news from RSS feeds, rewrite with AI, and auto-publish to the News section.
            </p>
            <Button onClick={handleScrape} disabled={scraping} className="w-full" variant="hero">
              {scraping ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scraping...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Fetch & Publish News</>
              )}
            </Button>
            {lastResult && (
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default">{lastResult.created} created</Badge>
                {lastResult.errors > 0 && <Badge variant="destructive">{lastResult.errors} errors</Badge>}
                <Badge variant="secondary">{lastResult.totalFound} found</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Weekly Newsletter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send this week's personalised newsletter to all active waitlist subscribers based on their interests.
            </p>
            <Button onClick={handleWeeklyNewsletter} className="w-full" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Send Weekly Newsletter Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsAutomation;
