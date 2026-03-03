import { useState, useEffect } from "react";
import { Bell, GraduationCap, Ticket as TicketIcon, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "ticket" | "pending_post" | "expert_application";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
}

export const AdminNotificationBell = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadNotifications();

    const ticketChannel = supabase
      .channel("admin-tickets")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultation_tickets" }, (payload) => {
        const ticket = payload.new as any;
        setNotifications((prev) => [{
          id: `ticket-${ticket.id}`, type: "ticket", title: "New Consultation Request",
          description: `${ticket.user_name || ticket.user_email} needs expert help`,
          created_at: ticket.created_at, read: false,
        }, ...prev.slice(0, 14)]);
      })
      .subscribe();

    const postChannel = supabase
      .channel("admin-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "news_posts", filter: "status=eq.pending" }, (payload) => {
        const post = payload.new as any;
        setNotifications((prev) => [{
          id: `post-${post.id}`, type: "pending_post", title: "New Post Pending Review",
          description: post.title, created_at: post.created_at, read: false,
        }, ...prev.slice(0, 14)]);
      })
      .subscribe();

    const expertChannel = supabase
      .channel("admin-experts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "expert_applications", filter: "status=eq.pending" }, (payload) => {
        const app = payload.new as any;
        setNotifications((prev) => [{
          id: `expert-${app.id}`, type: "expert_application", title: "New Expert Application",
          description: `${app.full_name} wants to become an expert`,
          created_at: app.created_at, read: false,
        }, ...prev.slice(0, 14)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(postChannel);
      supabase.removeChannel(expertChannel);
    };
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      const [{ data: tickets }, { data: posts }, { data: experts }] = await Promise.all([
        supabase.from("consultation_tickets").select("id, user_name, user_email, subject, created_at").eq("status", "open").order("created_at", { ascending: false }).limit(5),
        supabase.from("news_posts").select("id, title, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        supabase.from("expert_applications").select("id, full_name, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      ]);

      const all: Notification[] = [
        ...(tickets || []).map((t: any) => ({
          id: `ticket-${t.id}`, type: "ticket" as const, title: "Consultation Request",
          description: `${t.user_name || t.user_email}: ${t.subject}`, created_at: t.created_at, read: false,
        })),
        ...(posts || []).map((p: any) => ({
          id: `post-${p.id}`, type: "pending_post" as const, title: "Pending Post",
          description: p.title, created_at: p.created_at, read: false,
        })),
        ...(experts || []).map((e: any) => ({
          id: `expert-${e.id}`, type: "expert_application" as const, title: "Expert Application",
          description: `${e.full_name} wants to become an expert`, created_at: e.created_at, read: false,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

      setNotifications(all);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    if (notification.type === "ticket") navigate("/admin?tab=tickets");
    else if (notification.type === "pending_post") navigate("/admin?tab=posts");
    else if (notification.type === "expert_application") navigate("/admin?tab=experts");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  if (!isAdmin) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket": return <div className="w-2 h-2 rounded-full bg-orange-500" />;
      case "pending_post": return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case "expert_application": return <div className="w-2 h-2 rounded-full bg-green-500" />;
      default: return <div className="w-2 h-2 rounded-full bg-muted-foreground" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Admin Notifications</h4>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${!notification.read ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-2">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
