import { Link } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { NotificationType } from "@/shared/enums/NotificationType.enum";
import type { NotificationItem as NotificationItemType } from "@/shared/validations/NotificationSchema";
import ROUTES from "@/shared/lib/routes";
import { Trans } from "react-i18next";
import { useTranslation } from "@/shared/hooks/useTranslation";
import {
  MessageSquare,
  Users,
  MessageCircle,
  Heart,
  UserPlus,
  BookOpen,
  Bell,
  Clock,
} from "lucide-react";

interface NotificationItemProps {
  notification: NotificationItemType;
  onClick: (id: string) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const isUnread = !notification.isRead;

  const getTypeBadge = () => {
    switch (notification.type) {
      case NotificationType.CHAT_DIRECT:
        return {
          icon: <MessageSquare size={10} className="text-white" />,
          bg: "bg-blue-500",
        };
      case NotificationType.CHAT_GROUP:
        return {
          icon: <Users size={10} className="text-white" />,
          bg: "bg-emerald-500",
        };
      case NotificationType.COMMENT:
        return {
          icon: <MessageCircle size={10} className="text-white" />,
          bg: "bg-indigo-500",
        };
      case NotificationType.UPVOTE:
        return {
          icon: <Heart size={10} className="text-white" />,
          bg: "bg-rose-500",
        };
      case NotificationType.FOLLOW:
        return {
          icon: <UserPlus size={10} className="text-white" />,
          bg: "bg-purple-500",
        };
      case NotificationType.NEW_BLOG_POST:
        return {
          icon: <BookOpen size={10} className="text-white" />,
          bg: "bg-amber-500",
        };
      case NotificationType.SYSTEM:
      default:
        return {
          icon: <Bell size={10} className="text-white" />,
          bg: "bg-primary",
        };
    }
  };

  const { icon: badgeIcon, bg: badgeBg } = getTypeBadge();

  const getNotificationHeader = () => {
    const sender =
      notification.sender?.fullName || notification.sender?.username || t("notifications.defaultSender", "User");
    const group = notification.groupName || t("notifications.defaultGroup", "Study group");
    const { attachmentsCount = 0, replyTo } = notification.metadata || {};
    const hasAttachment = attachmentsCount > 0;
    const hasReply = !!replyTo;

    if (notification.type === NotificationType.SYSTEM) {
      return notification.content || t("notifications.systemNotice", "System notification");
    }

    const typePrefix =
      notification.type === NotificationType.CHAT_DIRECT
        ? "directMessage"
        : notification.type === NotificationType.COMMENT
          ? notification.metadata?.parentCommentId
            ? "reply"
            : "comment"
          : notification.type === NotificationType.UPVOTE
            ? notification.metadata?.commentId
              ? "upvoteComment"
              : "upvotePost"
            : notification.type === NotificationType.FOLLOW
              ? "follow"
              : notification.type === NotificationType.NEW_BLOG_POST
                ? "newPost"
                : "groupMessage";
    let typeSuffix = "";

    if (hasReply && hasAttachment) {
      typeSuffix = "WithReplyAndAttachment";
    } else if (hasReply) {
      typeSuffix = "WithReply";
    } else if (hasAttachment) {
      typeSuffix = "WithAttachment";
    }

    return (
      <Trans
        i18nKey={`notifications.${typePrefix}${typeSuffix}`}
        values={{ sender, group, count: attachmentsCount }}
        components={{ bold: <span className="font-extrabold text-foreground" /> }}
      />
    );
  };

  const getLink = () => {
    switch (notification.type) {
      case NotificationType.CHAT_DIRECT:
        return notification.senderId
          ? ROUTES.CHAT_TAB_USERS_ID.url.replace(":id", notification.senderId)
          : ROUTES.CHAT_TAB_USERS.url;
      case NotificationType.CHAT_GROUP:
        return notification.groupId
          ? ROUTES.CHAT_TAB_GROUPS_ID.url.replace(":id", notification.groupId)
          : ROUTES.CHAT_TAB_GROUPS.url;
      case NotificationType.COMMENT:
      case NotificationType.UPVOTE:
      case NotificationType.NEW_BLOG_POST:
        return notification.metadata?.blogId
          ? ROUTES.BLOG_DETAIL.url.replace(":id", notification.metadata.blogId)
          : ROUTES.BLOG.url;
      case NotificationType.FOLLOW:
        return ROUTES.PROFILE.url.replace(
          ":username",
          notification.sender?.username || ""
        );
      default:
        return "#";
    }
  };

  const getState = () => {
    if (notification.type === NotificationType.CHAT_DIRECT) {
      return {
        startChatWith: {
          id: notification.senderId,
          username: notification.sender?.username,
          fullName: notification.sender?.fullName,
          avatar: notification.sender?.avatar,
        },
      };
    }
    if (notification.type === NotificationType.CHAT_GROUP) {
      return {
        openGroupId: notification.groupId,
      };
    }
    return undefined;
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return t("notifications.justNow", "Just now");
      if (diff < 3600) return t("notifications.minutesAgo", { count: Math.floor(diff / 60) });
      if (diff < 86400) return t("notifications.hoursAgo", { count: Math.floor(diff / 3600) });
      if (diff < 604800) return t("notifications.daysAgo", { count: Math.floor(diff / 86400) });
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const hasSnippet = Boolean(
    notification.content && notification.type !== NotificationType.SYSTEM
  );

  return (
    <Link
      to={getLink()}
      state={getState()}
      onClick={() => onClick(notification.id)}
      className={`group relative flex ${
        hasSnippet ? "items-start" : "items-center"
      } gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 ${
        isUnread
          ? "bg-primary/[0.03] border-primary/30 hover:border-primary/50 hover:bg-primary/[0.06] shadow-xs"
          : "bg-card border-border/80 hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      {/* Unread Accent Left Bar Indicator */}
      {isUnread && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}

      {/* Avatar with Type Icon Badge */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-background shadow-xs ring-1 ring-border/50">
          <AvatarImage
            src={notification.sender?.avatar || ""}
            alt={notification.sender?.username || "Avatar"}
            className="object-cover"
          />
          <AvatarFallback className="font-extrabold text-xs bg-muted text-foreground">
            {notification.sender?.fullName?.charAt(0).toUpperCase() ||
              (notification.type === NotificationType.SYSTEM ? "S" : "U")}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full ring-2 ring-background ${badgeBg} shadow-xs`}
        >
          {badgeIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div
            className={`text-xs sm:text-sm leading-snug truncate ${
              isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
            }`}
          >
            {getNotificationHeader()}
          </div>

          {/* Time & Unread Dot */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              <Clock size={11} className="opacity-70" />
              {getTimeAgo(notification.createdAt)}
            </span>
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20 shrink-0" />
            )}
          </div>
        </div>

        {/* Message / Snippet Preview */}
        {hasSnippet && (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs font-medium text-muted-foreground line-clamp-2 leading-relaxed mt-1">
            "{notification.content}"
          </div>
        )}
      </div>
    </Link>
  );
}
