import { Helmet } from "react-helmet-async";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.split("/").filter(Boolean).map(s => s.replace(/-/g, " ")).join(" › ");

  return (
    <>
      <Helmet>
        <title>Coming Soon | Embraix</title>
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background flex items-center justify-center">
        <Card className="max-w-md gradient-card border-border/50">
          <CardContent className="p-8 text-center space-y-4">
            <Construction className="w-12 h-12 text-primary mx-auto" />
            <h1 className="font-display text-2xl font-bold capitalize">{pageName || "Coming Soon"}</h1>
            <p className="text-muted-foreground">This section is under development. Join our waitlist to be notified when it launches.</p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
              <Button variant="hero" onClick={() => navigate("/waitlist")}>Join Waitlist</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default ComingSoon;
