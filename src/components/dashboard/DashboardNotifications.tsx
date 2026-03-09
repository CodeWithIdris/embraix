import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserNotifications } from "@/hooks/useDashboard";
import { Bell, Loader2, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const DashboardNotifications = () => {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useUserNotifications();
  const queryClient = useQueryClient();

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["user-notifications", user.id] });
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["user-notifications", user?.id] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !notifications?.length ? (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`gradient-card border-border/50 transition-all cursor-pointer ${!n.is_read ? "border-l-2 border-l-primary" : ""}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(n.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardNotifications;
