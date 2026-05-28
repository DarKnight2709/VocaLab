import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { GetNotificationResponse, NotificationItem } from "@/shared/validations/NotificationSchema";
import { useQueryClient } from "@tanstack/react-query";
import { groupKeys } from "@/features/chat/api/groupService";
import { NOTIFICATION_KEYS } from "@/features/notification/api/notificationService";

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const socketReadyRef = useRef(false);

  const storeSocket = useSocketStore((s) => s.socket);
  
  useEffect(() => {
    if (!storeSocket) return;
    const socket = storeSocket;
    socketRef.current = socket;

    // Hàm chủ động báo với server là mình đã sẵn sàng nhận dữ liệu
    const onConnect = () => {
      socketReadyRef.current = true;
      socket.emit("entering");
    };

    // Nếu socket đã kết nối rồi
    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);

    socket.on("disconnect", () => {
      socketReadyRef.current = false;
    });

    socket.on(
      "receive-notification",
      (notification: NotificationItem) => {
        console.log("NOTIFICATION RECEIVED", notification);
        if (notification) {
          // 1. Update unread count
          queryClient.setQueryData<number>(
            NOTIFICATION_KEYS.unreadCount(),
            (prev) => (prev || 0) + 1,
          );

          // 2. Optimistic update for the notification list
          // We update the first page (usually page 1, limit 20) if it exists in cache
          queryClient.setQueriesData<GetNotificationResponse>(
            { queryKey: NOTIFICATION_KEYS.lists() },
            (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                notifications: [notification, ...oldData.notifications],
                meta: {
                  ...oldData.meta,
                  total: oldData.meta.total + 1,
                },
              };
            }
          );
        }
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
      socket.off("receive-notification");
      socket.off("reload-groups");
      socketRef.current = null;
    };
  }, [queryClient, storeSocket]);


  return { socketRef };
}
