import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDownloadedReports } from "@/hooks/useDashboard";
import { FileDown, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const DashboardReports = () => {
  const { data: reports, isLoading } = useDownloadedReports();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Downloaded Reports</h2>
        <Button size="sm" variant="outline" onClick={() => navigate("/insight/reports")}>
          Browse Reports
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !reports?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <FileDown className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No downloaded reports</p>
            <Button variant="hero" size="sm" className="mt-4" onClick={() => navigate("/insight/reports")}>
              Browse Reports
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((r: any) => (
            <Card key={r.id} className="gradient-card border-border/50">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{r.report_title}</p>
                  <p className="text-xs text-muted-foreground">
                    Downloaded: {format(new Date(r.downloaded_at), "MMM d, yyyy")}
                  </p>
                </div>
                {r.report_url && (
                  <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
                    <a href={r.report_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardReports;
