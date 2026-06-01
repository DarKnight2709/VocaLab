import { Link } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { NotificationType } from "@/shared/enums/NotificationType.enum";
import type { NotificationItem } from "@/shared/validations/NotificationSchema";
import ROUTES from "@/shared/lib/routes";
import { Trans } from "react-i18next";

interface NotificationItemProps {
  notification: NotificationItem;
  onClick: (id: string) => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const isUnread = !notification.isRead;

  const getNotificationHeader = () => {
    console.log(notification.metadata)
    const sender =
      notification.sender?.fullName || notification.sender?.username;
    const group = notification.groupName || "Unknown Group";    
    const { attachmentsCount = 0, replyTo } = notification.metadata || {};
    const hasAttachment = attachmentsCount > 0;
    const hasReply = !!replyTo;

    if (notification.type === NotificationType.SYSTEM) {
      return notification.content || "System notification";
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
        components={{ bold: <span className="font-bold text-foreground" /> }}
      />
    );
  };

  const getLink = () => {
    switch (notification.type) {
      case NotificationType.CHAT_DIRECT:
      case NotificationType.CHAT_GROUP:
        return ROUTES.CHAT.url;
      case NotificationType.COMMENT:
      case NotificationType.UPVOTE:
      case NotificationType.NEW_BLOG_POST:
        return notification.metadata?.blogId
          ? ROUTES.BLOG_DETAIL.url.replace(":id", notification.metadata.blogId)
          : ROUTES.BLOG.url;
      case NotificationType.FOLLOW:
        return ROUTES.PROFILE.url.replace(":username", notification.sender?.username || "");
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

  return (
    <Link
      to={getLink()}
      state={getState()}
      onClick={() => onClick(notification.id)}
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors hover:bg-muted/50 ${
        isUnread ? "bg-primary/5" : "bg-card"
      } border`}
    >
      <Avatar className="h-10 w-10 border shrink-0">
        <AvatarImage
          src={notification.sender?.avatar || ""}
          alt={notification.sender?.username}
        />
        <AvatarFallback>
          {notification.sender?.fullName?.charAt(0).toUpperCase() || "S"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`text-sm ${isUnread ? "font-semibold text-foreground" : "text-muted-foreground"}`}
          >
            {getNotificationHeader()}
          </div>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        {notification.content &&
          notification.type !== NotificationType.SYSTEM && (
            <p className="text-sm text-foreground truncate">
              {notification.content}
            </p>
          )}
        <p className="text-xs text-muted-foreground">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
