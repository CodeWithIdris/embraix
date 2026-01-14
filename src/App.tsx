import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
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
import Store from "./pages/Store";
import Centre from "./pages/Centre";
import ConsultExpert from "./pages/ConsultExpert";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
                <Route path="/media/:category" element={<MediaPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsPost />} />
                <Route path="/store" element={<Store />} />
                <Route path="/centre/:section" element={<Centre />} />
                <Route path="/consult-expert" element={<ConsultExpert />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
