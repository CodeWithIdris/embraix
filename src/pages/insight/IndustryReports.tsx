import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, BarChart3, Zap, Leaf } from "lucide-react";

const reports = [
  {
    id: 1,
    title: "Global Solar Energy Market Analysis 2026",
    description: "Comprehensive analysis of solar energy adoption trends, market dynamics, and growth projections across major economies.",
    category: "Market Analysis",
    date: "January 2026",
    pages: 48,
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Agricultural Technology Integration Report",
    description: "Deep dive into how modern farms are integrating IoT, AI, and automation to improve yields and sustainability.",
    category: "Agriculture",
    date: "December 2025",
    pages: 62,
    icon: Leaf,
  },
  {
    id: 3,
    title: "Renewable Energy ROI Analysis",
    description: "Financial analysis and return on investment metrics for solar, wind, and hybrid renewable energy systems.",
    category: "Finance",
    date: "November 2025",
    pages: 35,
    icon: BarChart3,
  },
  {
    id: 4,
    title: "Smart Grid Implementation Strategies",
    description: "Technical and strategic guide for implementing smart grid solutions in residential and commercial settings.",
    category: "Technology",
    date: "October 2025",
    pages: 54,
    icon: Zap,
  },
];

const IndustryReports = () => {
  return (
    <>
      <Helmet>
        <title>Industry Reports | Embraix</title>
        <meta name="description" content="In-depth analysis and trends in solar energy, agriculture, and sustainable technology industries." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Research & Analysis</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Industry Reports
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access comprehensive research and data-driven insights on solar energy, 
                agricultural technology, and sustainable innovation.
              </p>
            </div>

            {/* Reports Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {reports.map((report) => (
                <Card key={report.id} className="group hover:shadow-lg transition-all duration-300 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <report.icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline">{report.category}</Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {report.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {report.date}
                        </span>
                        <span>{report.pages} pages</span>
                      </div>
                      <Button size="sm" variant="ghost" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <h3 className="text-xl font-semibold mb-2">Need Custom Research?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our team can prepare tailored industry analysis for your specific needs.
                  </p>
                  <Button>Request Custom Report</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default IndustryReports;
