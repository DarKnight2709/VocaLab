import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type {
  UserItem,
  ChatMessageItem,
} from "@/shared/validations/ChatSchema";
import type { NotificationItem } from "@/shared/validations/NotificationSchema";
import type {
  GroupItem,
  GroupMessageItem,
} from "@/shared/validations/GroupSchema";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/api/chatService";
import { groupKeys } from "@/features/chat/api/groupService";
import { NOTIFICATION_KEYS } from "@/features/notification/api/notificationService";

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const socketReadyRef = useRef(false);

  useEffect(() => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;
    socketRef.current = socket;

    // Hàm chủ động báo với server là mình đã sẵn sàng nhận dữ liệu
    const onConnect = () => {
      socketReadyRef.current = true;
      socket.emit("entering");
    };

    // Nếu socket đã kết nối rồi (trường hợp login xong mới vào component này)
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", () => {
      socketReadyRef.current = false;
    });

    socket.on(
      "receive-message",
      (payload: {
        message: ChatMessageItem;
        notification: NotificationItem;
      }) => {
        const msg = payload.message;
        const notification = payload.notification;
        // stop here to create the api to fetch notification.
        // increase number of the notifications
        // update the notifications I have in real time
        // if (in then notification page, update page and the number on the bell icon) else just update the number on the bell icon
        if (notification) {
          queryClient.setQueryData<number>(
            NOTIFICATION_KEYS.unreadCount(),
            (prev) => (prev || 0) + 1,
          );
          void queryClient.invalidateQueries({
            queryKey: NOTIFICATION_KEYS.lists(),
          });
        }

        console.log("RECEIVE MESSAGE", msg);
        const senderId = msg.senderId ?? msg.sender?.id;
        if (!senderId) return;
        queryClient.setQueryData<ChatMessageItem[]>(
          chatKeys.messages(senderId),
          (prev) => [...(prev || []), msg],
        );

        queryClient.setQueryData<UserItem[]>(chatKeys.list(), (prev) => {
          if (!prev) return prev;
          const userIdx = prev.findIndex((u) => u.id === senderId);
          if (userIdx === -1) return prev;
          const next = [...prev];
          const newUser = { ...next[userIdx] };
          newUser.lastMessage = {
            isMine: false,
            content: msg.content || undefined,
          };
          // We move them to top of list
          next.splice(userIdx, 1);
          return [newUser, ...next];
        });

        // Refresh list to ensure accurate unread counters sync from server
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      },
    );

    socket.on(
      "receive-group-message",
      (payload: {
        message: GroupMessageItem;
        notification: NotificationItem;
      }) => {
        const msg = payload.message;
        const notification = payload.notification;

        if (notification) {
          queryClient.setQueryData<number>(
            NOTIFICATION_KEYS.unreadCount(),
            (prev) => (prev || 0) + 1,
          );
          void queryClient.invalidateQueries({
            queryKey: NOTIFICATION_KEYS.lists(),
          });
        }

        // Refresh group list for unread/lastMessage
        // void queryClient.invalidateQueries({ queryKey: groupKeys.list() });

        queryClient.setQueryData<GroupMessageItem[]>(
          groupKeys.messages(msg.groupId),
          (prev) => [...(prev || []), msg],
        );

        queryClient.setQueryData<GroupItem[]>(groupKeys.list(), (prev) => {
          if (!prev) return prev;
          const groupIdx = prev.findIndex((g) => g.id === msg.groupId);
          if (groupIdx === -1) return prev;
          const next = [...prev];
          const newGroup = { ...next[groupIdx] };
          newGroup.lastMessage = {
            isMine: false,
            content: msg.content || undefined,
            senderName:
              msg.sender?.fullName || msg.sender?.username || "Someone",
            createdAt: msg.createdAt,
          };
          next.splice(groupIdx, 1);
          return [newGroup, ...next];
        });

        // Always invalidate to sync actual unread counts
        void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      },
    );

    socket.on("reload-groups", (data?: { groupId?: string }) => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
      if (data?.groupId) {
        void queryClient.invalidateQueries({
          queryKey: groupKeys.detail(data.groupId),
        });
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect");
      socket.off("receive-message");
      socket.off("receive-group-message");
      socket.off("reload-groups");
      // do not force-disconnect here; AuthStore handles disconnect on logout
      socketRef.current = null;
    };
  }, [queryClient]);

  return { socketRef };
}
