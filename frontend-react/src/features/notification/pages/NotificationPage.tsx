import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  Bell,
  CheckCheck,
  Loader2,
  Settings,
  MessageSquare,
  Sparkles,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import Breadcrumb from "@/shared/components/Breadcrumb";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
} from "../api/notificationService";
import { NotificationItem } from "../components/NotificationItem";
import { NotificationType } from "@/shared/enums/NotificationType.enum";
import ROUTES from "@/shared/lib/routes";
import { Button } from "@/shared/components/ui/button";

type FilterTab = "all" | "unread" | "chat" | "activity" | "system";

export default function NotificationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: notificationsRes, isLoading } = useNotificationsQuery(page, limit);
  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const markAsReadMutation = useMarkAsReadMutation();

  const rawNotifications = notificationsRes?.notifications || [];
  const meta = notificationsRes?.meta;

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return rawNotifications.filter((n) => !n.isRead);
      case "chat":
        return rawNotifications.filter(
          (n) =>
            n.type === NotificationType.CHAT_DIRECT ||
            n.type === NotificationType.CHAT_GROUP
        );
      case "activity":
        return rawNotifications.filter(
          (n) =>
            n.type === NotificationType.COMMENT ||
            n.type === NotificationType.UPVOTE ||
            n.type === NotificationType.FOLLOW ||
            n.type === NotificationType.NEW_BLOG_POST
        );
      case "system":
        return rawNotifications.filter((n) => n.type === NotificationType.SYSTEM);
      case "all":
      default:
        return rawNotifications;
    }
  }, [rawNotifications, activeTab]);

  const handleMarkAllAsRead = () => {
    markAsReadMutation.mutate(undefined);
  };

  const handleNotificationClick = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "all",
      label: t("notifications.tabs.all", "All"),
      icon: <Inbox size={14} />,
    },
    {
      key: "unread",
      label: t("notifications.tabs.unread", "Unread"),
      icon: <Filter size={14} />,
    },
    {
      key: "chat",
      label: t("notifications.tabs.chat", "Messages & Groups"),
      icon: <MessageSquare size={14} />,
    },
    {
      key: "activity",
      label: t("notifications.tabs.activity", "Interactions & Blog"),
      icon: <Sparkles size={14} />,
    },
    {
      key: "system",
      label: t("notifications.tabs.system", "System"),
      icon: <Bell size={14} />,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
      <div className="w-full max-w-3xl mx-auto space-y-5 animate-in fade-in duration-300">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: t("notifications.title") }]} />

        {/* Header Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {t("notifications.title")}
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold shadow-xs">
                  {t("notifications.unreadBadge", { count: unreadCount, defaultValue: `${unreadCount} unread` })}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              {t("notifications.description")}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAsReadMutation.isPending || unreadCount === 0}
              className="h-9 px-4 rounded-xl border-border/80 text-xs font-bold gap-2 text-foreground hover:bg-muted/80 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              {markAsReadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
              )}
              <span>{t("notifications.markAllAsRead")}</span>
            </Button>

            <Link
              to={ROUTES.ME_SETTING_NOTIFICATIONS.url}
              className="h-9 w-9 rounded-xl border border-border/80 bg-card hover:bg-muted/70 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-xs transition-colors"
              title={t("notifications.settings", "Notification settings")}
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>

        {/* Filter Segmented Pill Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card border border-border/80 shadow-xs overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-3xl bg-muted/40 border border-border/60"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border/80 p-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60 border border-border/60 text-muted-foreground/50 shadow-xs">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-extrabold text-foreground">
              {activeTab === "unread"
                ? t("notifications.noUnread", "No unread notifications")
                : t("notifications.empty")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {activeTab === "unread"
                ? t("notifications.noUnreadHint", "You are all caught up with your latest notifications.")
                : t("notifications.emptyHint")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <p className="text-xs font-medium text-muted-foreground">
              {t("notifications.page", "Page")} <span className="font-extrabold text-foreground">{page}</span> /{" "}
              {meta.lastPage}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3 rounded-xl border-border/80 text-xs font-bold gap-1"
              >
                <ChevronLeft size={14} />
                <span>{t("notifications.prev", "Previous")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                disabled={page >= meta.lastPage}
                className="h-8 px-3 rounded-xl border-border/80 text-xs font-bold gap-1"
              >
                <span>{t("notifications.next", "Next")}</span>
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
