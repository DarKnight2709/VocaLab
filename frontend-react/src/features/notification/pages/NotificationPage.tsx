import { useTranslation } from "@/shared/hooks/useTranslation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useNotificationsQuery, useMarkAsReadMutation } from "../api/notificationService";
import { NotificationItem } from "../components/NotificationItem";


export default function NotificationPage() {
  const { t } = useTranslation();
  const { data: notificationsRes, isLoading } = useNotificationsQuery(1, 20); // Using 1 for now, or infinite query if using infinite scroll, but wait useNotifications uses regular query
  const markAsReadMutation = useMarkAsReadMutation();

  const notifications = notificationsRes?.notifications || [];

  const handleMarkAllAsRead = () => {
    markAsReadMutation.mutate(undefined);
  };

  const handleNotificationClick = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8 bg-background">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Breadcrumb items={[{ label: t("notifications.title") }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("notifications.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("notifications.description")}
            </p>
          </div>
          
          <button 
            className="flex self-start sm:self-auto items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full font-medium disabled:opacity-50 shrink-0"
            onClick={handleMarkAllAsRead}
            disabled={markAsReadMutation.isPending || notifications.length === 0}
          >
            {markAsReadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            {t("notifications.markAllAsRead")}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-xl border p-6 shadow-sm min-h-100 flex items-center justify-center">
            <div className="text-center flex flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">{t("notifications.empty")}</p>
              <p className="text-sm mt-1">{t("notifications.emptyHint")}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
