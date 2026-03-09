import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardChats from "@/components/dashboard/DashboardChats";
import DashboardServiceRequests from "@/components/dashboard/DashboardServiceRequests";
import DashboardConsultations from "@/components/dashboard/DashboardConsultations";
import DashboardSavedProducts from "@/components/dashboard/DashboardSavedProducts";
import DashboardReports from "@/components/dashboard/DashboardReports";
import DashboardNotifications from "@/components/dashboard/DashboardNotifications";
import DashboardSettings from "@/components/dashboard/DashboardSettings";
import Header from "@/components/Header";
import { MyPosts } from "@/components/profile/MyPosts";

const sectionComponents: Record<string, React.ComponentType> = {
  overview: DashboardOverview,
  chats: DashboardChats,
  "service-requests": DashboardServiceRequests,
  consultations: DashboardConsultations,
  "saved-products": DashboardSavedProducts,
  reports: DashboardReports,
  notifications: DashboardNotifications,
  settings: DashboardSettings,
};

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(searchParams.get("tab") || "overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setSearchParams({ tab: section });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ActiveComponent = sectionComponents[activeSection] || DashboardOverview;

  return (
    <>
      <Helmet>
        <title>Dashboard | Embraix</title>
        <meta name="description" content="Manage your Embraix account, track requests, and view activity" />
      </Helmet>

      <Header />

      <div className="pt-16">
        <SidebarProvider>
          <div className="min-h-[calc(100svh-4rem)] flex w-full">
            <DashboardSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

            <div className="flex-1 flex flex-col min-w-0">
              <div className="h-12 flex items-center border-b border-border px-4">
                <SidebarTrigger />
                <span className="ml-3 text-sm font-medium text-muted-foreground capitalize">
                  {activeSection.replace("-", " ")}
                </span>
              </div>

              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-4xl">
                  <ActiveComponent />

                  {activeSection === "overview" && (
                    <div className="mt-8">
                      <MyPosts />
                    </div>
                  )}
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
};

export default Profile;
