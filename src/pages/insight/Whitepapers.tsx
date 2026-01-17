import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Clock, BookOpen } from "lucide-react";

const whitepapers = [
  {
    id: 1,
    title: "The Future of Solar Energy in Sub-Saharan Africa",
    abstract: "An in-depth technical analysis of solar energy potential, infrastructure requirements, and policy recommendations for accelerating renewable adoption across the region.",
    category: "Energy Policy",
    readTime: "25 min read",
    pages: 32,
    authors: ["Dr. Adebayo Okonkwo", "Sarah Mitchell"],
    publishDate: "January 2026",
  },
  {
    id: 2,
    title: "Precision Agriculture: A Technical Guide",
    abstract: "Comprehensive overview of IoT sensors, drone technology, and AI-driven analytics for optimizing crop management and resource utilization in modern farming.",
    category: "AgriTech",
    readTime: "35 min read",
    pages: 48,
    authors: ["Prof. Chinedu Eze", "Maria Santos"],
    publishDate: "December 2025",
  },
  {
    id: 3,
    title: "Battery Storage Systems: Technical Specifications & Best Practices",
    abstract: "Detailed examination of lithium-ion, flow batteries, and emerging storage technologies for residential, commercial, and grid-scale applications.",
    category: "Energy Storage",
    readTime: "40 min read",
    pages: 56,
    authors: ["Dr. James Chen", "Oluwaseun Adeyemi"],
    publishDate: "November 2025",
  },
  {
    id: 4,
    title: "Smart Grid Integration for Distributed Solar Systems",
    abstract: "Technical framework for integrating distributed solar generation with existing grid infrastructure, including inverter specifications and grid stability considerations.",
    category: "Grid Technology",
    readTime: "30 min read",
    pages: 42,
    authors: ["Eng. Fatima Hassan", "Dr. Robert Williams"],
    publishDate: "October 2025",
  },
  {
    id: 5,
    title: "Sustainable Water Management in Agriculture",
    abstract: "Analysis of drip irrigation, soil moisture sensors, and water recycling systems for reducing agricultural water consumption while maintaining productivity.",
    category: "Water Management",
    readTime: "20 min read",
    pages: 28,
    authors: ["Dr. Amina Bello", "Thomas Anderson"],
    publishDate: "September 2025",
  },
];

const Whitepapers = () => {
  return (
    <>
      <Helmet>
        <title>Whitepapers | Embraix</title>
        <meta name="description" content="Access technical documents and in-depth research on solar energy, agricultural technology, and sustainable solutions." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">Technical Research</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Whitepapers
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Deep-dive technical documents covering the latest advancements in 
                renewable energy, agricultural technology, and sustainable innovation.
              </p>
            </div>

            {/* Whitepapers List */}
            <div className="max-w-4xl mx-auto space-y-6">
              {whitepapers.map((paper) => (
                <Card 
                  key={paper.id} 
                  className="hover:shadow-lg transition-all duration-300 border-border/50"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge>{paper.category}</Badge>
                          <span className="text-sm text-muted-foreground">{paper.publishDate}</span>
                        </div>
                        <CardTitle className="text-xl md:text-2xl hover:text-primary transition-colors cursor-pointer">
                          {paper.title}
                        </CardTitle>
                      </div>
                      <div className="hidden md:flex p-3 rounded-lg bg-primary/10 text-primary">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {paper.abstract}
                    </p>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Authors: </span>
                      {paper.authors.join(", ")}
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {paper.readTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          {paper.pages} pages
                        </span>
                      </div>
                      <Button size="sm" className="gap-2 mt-3 sm:mt-0">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Newsletter CTA */}
            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="py-8">
                  <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
                  <p className="text-muted-foreground mb-4">
                    Get notified when we publish new research and technical documents.
                  </p>
                  <Button variant="outline">Subscribe to Updates</Button>
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

export default Whitepapers;
