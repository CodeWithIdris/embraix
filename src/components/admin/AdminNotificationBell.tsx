import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
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
  type: "ticket" | "pending_post";
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

    // Subscribe to real-time updates
    const ticketChannel = supabase
      .channel("admin-tickets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_tickets",
        },
        (payload) => {
          const ticket = payload.new as any;
          const newNotification: Notification = {
            id: `ticket-${ticket.id}`,
            type: "ticket",
            title: "New Consultation Request",
            description: `${ticket.user_name || ticket.user_email} needs expert help`,
            created_at: ticket.created_at,
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    const postChannel = supabase
      .channel("admin-posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "news_posts",
          filter: "status=eq.pending",
        },
        (payload) => {
          const post = payload.new as any;
          const newNotification: Notification = {
            id: `post-${post.id}`,
            type: "pending_post",
            title: "New Post Pending Review",
            description: post.title,
            created_at: post.created_at,
            read: false,
          };
          setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(postChannel);
    };
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      // Load recent tickets
      const { data: tickets } = await supabase
        .from("consultation_tickets")
        .select("id, user_name, user_email, subject, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);

      // Load pending posts
      const { data: posts } = await supabase
        .from("news_posts")
        .select("id, title, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      const ticketNotifications: Notification[] = (tickets || []).map((t) => ({
        id: `ticket-${t.id}`,
        type: "ticket" as const,
        title: "Consultation Request",
        description: `${t.user_name || t.user_email}: ${t.subject}`,
        created_at: t.created_at,
        read: false,
      }));

      const postNotifications: Notification[] = (posts || []).map((p) => ({
        id: `post-${p.id}`,
        type: "pending_post" as const,
        title: "Pending Post",
        description: p.title,
        created_at: p.created_at,
        read: false,
      }));

      const allNotifications = [...ticketNotifications, ...postNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setNotifications(allNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setOpen(false);
    if (notification.type === "ticket") {
      navigate("/admin?tab=tickets");
    } else {
      navigate("/admin?tab=posts");
    }
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isAdmin) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "ticket"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
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
