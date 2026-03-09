import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BlogMedia from "@/components/BlogMedia";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import { FloatingAIConsult } from "@/components/FloatingAIConsult";
import TrendingInsights from "@/components/TrendingInsights";
import { OnboardingModal } from "@/components/OnboardingModal";
import { FeedbackButton } from "@/components/FeedbackButton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect } from "react";

const Index = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    track({ eventType: "page_view", metadata: { page: "/" } });
  }, []);

  return (
    <>
      <Helmet>
        <title>Embraix - Clean Energy, Electric Vehicles & Smart Technologies for Africa</title>
        <meta 
          name="description" 
          content="Embraix is Africa's leading platform for clean energy, electric vehicles, and smart technology knowledge, innovation, and collaboration. Get free AI-powered consultations." 
        />
        <meta name="keywords" content="clean energy, electric vehicles, solar power, sustainable technology, Africa, EV charging, smart technology" />
        <meta property="og:title" content="Embraix - Sustainable Technology Platform for Africa" />
        <meta property="og:description" content="Your comprehensive platform for clean energy, EVs, and smart technologies. Empowering Africa and the world." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://embraix.com" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <TrendingInsights />
          <BlogMedia />
          <Features />
        </main>
        <Footer />
        <FloatingAIConsult />
        <FeedbackButton />
        <OnboardingModal />
      </div>
    </>
  );
};

export default Index;
