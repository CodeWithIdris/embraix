import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  Headphones,
  Users,
  Heart,
  FileDown,
  Bell,
  Settings,
} from "lucide-react";
import { useUserNotifications } from "@/hooks/useDashboard";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "chats", label: "AI Chats", icon: MessageSquare },
  { id: "service-requests", label: "Service Requests", icon: Headphones },
  { id: "consultations", label: "Consultations", icon: Users },
  { id: "saved-products", label: "Saved Products", icon: Heart },
  { id: "reports", label: "Reports", icon: FileDown },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: notifications } = useUserNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="w-4 h-4" />
                    {!collapsed && (
                      <span className="flex items-center justify-between flex-1">
                        {item.label}
                        {item.id === "notifications" && unreadCount > 0 && (
                          <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 min-w-5 flex items-center justify-center">
                            {unreadCount}
                          </Badge>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
