import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { CompareProvider } from "@/contexts/CompareContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Newsletter from "./pages/Newsletter";
import Promotions from "./pages/Promotions";
import MediaPage from "./pages/MediaPage";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import NotFound from "./pages/NotFound";
import MediaHub from "./pages/MediaHub";
import AIHub from "./pages/AIHub";
import InsightHub from "./pages/InsightHub";
import StoreHub from "./pages/StoreHub";
import CentreHub from "./pages/CentreHub";
import ComingSoon from "./pages/ComingSoon";
import Centre from "./pages/Centre";
import ConsultExpert from "./pages/ConsultExpert";
import IndustryReports from "./pages/insight/IndustryReports";
import CaseStudies from "./pages/insight/CaseStudies";
import Whitepapers from "./pages/insight/Whitepapers";
import BrowseServices from "./pages/centre/BrowseServices";
import ProviderRegister from "./pages/centre/ProviderRegister";
import ProviderProfile from "./pages/centre/ProviderProfile";
import ProviderDashboard from "./pages/centre/ProviderDashboard";
import ExpertDashboard from "./pages/ExpertDashboard";
import ExpertApply from "./pages/ExpertApply";
import ExpertProfile from "./pages/ExpertProfile";
import ExpertMarketplace from "./pages/centre/ExpertMarketplace";
import SupportServices from "./pages/centre/SupportServices";
import InstallerRegister from "./pages/centre/InstallerRegister";
import InstallerDashboard from "./pages/centre/InstallerDashboard";
import Waitlist from "./pages/Waitlist";
import Explore from "./pages/Explore";
import WaitlistPopup from "./components/WaitlistPopup";
import StoreProducts from "./pages/StoreProducts";
import StoreCompare from "./pages/StoreCompare";
import SubmitResearch from "./pages/insight/SubmitResearch";
import ResearchPublications from "./pages/insight/ResearchPublications";
import StoriesVoices from "./pages/media/StoriesVoices";
import StoryDetail from "./pages/media/StoryDetail";
import SubmitStory from "./pages/media/SubmitStory";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/newsletter" element={<Newsletter />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/profile" element={<Profile />} />

                {/* Media */}
                <Route path="/media" element={<MediaHub />} />
                <Route path="/media/reports" element={<ComingSoon />} />
                <Route path="/media/reviews" element={<ComingSoon />} />
                <Route path="/media/diy-guides" element={<MediaPage />} />
                <Route path="/media/stories" element={<StoriesVoices />} />
                <Route path="/media/stories/submit" element={<SubmitStory />} />
                <Route path="/media/stories/:slug" element={<StoryDetail />} />
                <Route path="/media/articles" element={<Blog />} />
                <Route path="/media/:category" element={<MediaPage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsPost />} />

                {/* AI */}
                <Route path="/ai" element={<AIHub />} />
                <Route path="/ai/:section" element={<ComingSoon />} />

                {/* Centre */}
                <Route path="/centre" element={<CentreHub />} />
                <Route path="/centre/browse" element={<BrowseServices />} />
                <Route path="/centre/register" element={<ProviderRegister />} />
                <Route path="/centre/dashboard" element={<ProviderDashboard />} />
                <Route path="/centre/provider/:id" element={<ProviderProfile />} />
                <Route path="/centre/learning" element={<ComingSoon />} />
                <Route path="/centre/collaboration" element={<ComingSoon />} />
                <Route path="/centre/products" element={<ComingSoon />} />
                <Route path="/centre/innovation" element={<ComingSoon />} />
                <Route path="/centre/experts" element={<ExpertMarketplace />} />
                <Route path="/centre/support-services" element={<SupportServices />} />
                <Route path="/centre/installer-register" element={<InstallerRegister />} />
                <Route path="/centre/installer-dashboard" element={<InstallerDashboard />} />
                <Route path="/centre/:section" element={<Centre />} />
                <Route path="/consult-expert" element={<ConsultExpert />} />
                <Route path="/expert-dashboard" element={<ExpertDashboard />} />
                <Route path="/expert/apply" element={<ExpertApply />} />
                <Route path="/experts/:id" element={<ExpertProfile />} />

                {/* Insight */}
                <Route path="/insight" element={<InsightHub />} />
                <Route path="/insight/reports" element={<IndustryReports />} />
                <Route path="/insight/case-studies" element={<CaseStudies />} />
                <Route path="/insight/whitepapers" element={<Whitepapers />} />
                <Route path="/insight/submit-research" element={<SubmitResearch />} />
                <Route path="/insight/research" element={<ResearchPublications />} />
                <Route path="/insight/trends" element={<ComingSoon />} />
                <Route path="/insight/impact-reports" element={<ComingSoon />} />
                <Route path="/insight/market-intelligence" element={<ComingSoon />} />
                <Route path="/insight/community-insights" element={<ComingSoon />} />
                <Route path="/insight/policy" element={<ComingSoon />} />

                {/* Store */}
                <Route path="/store" element={<StoreHub />} />
                <Route path="/store/products" element={<StoreProducts />} />
                <Route path="/store/compare" element={<StoreCompare />} />
                <Route path="/store/:category" element={<ComingSoon />} />
                <Route path="/store/:category" element={<ComingSoon />} />

                <Route path="/explore" element={<Explore />} />
                <Route path="/waitlist" element={<Waitlist />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <WaitlistPopup />
          </TooltipProvider>
          </CompareProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
