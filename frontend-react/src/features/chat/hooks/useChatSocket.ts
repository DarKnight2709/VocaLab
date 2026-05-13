import { useEffect, useMemo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { UserItem, ChatMessageItem } from "@/shared/validations/ChatSchema";
import type { GroupItem, GroupMessageItem } from "@/shared/validations/GroupSchema";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/api/chatService";
import { groupKeys } from "@/features/chat/api/groupService";

type UseChatSocketProps = {
  myId: string;
  selectedUser: UserItem | null;
  selectedGroup: GroupItem | null;
  groups: GroupItem[];
  setOnlineIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTypingUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  setGroupTypingText: React.Dispatch<React.SetStateAction<string>>;
};

export function useChatSocket({
  myId,
  selectedUser,
  selectedGroup,
  groups,
  setOnlineIds,
  setTypingUsers,
  setGroupTypingText,
}: UseChatSocketProps) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const selectedUserRef = useRef<UserItem | null>(null);
  const selectedGroupRef = useRef<GroupItem | null>(null);
  const joinedGroupsRef = useRef<Set<string>>(new Set());
  const socketReadyRef = useRef(false);

  const groupIds = useMemo(
    () => groups.map((g) => g.id).filter(Boolean),
    [groups],
  );

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return;
    socketRef.current = socket;

    // Hàm chủ động báo với server là mình đã sẵn sàng nhận dữ liệu
    const onConnect = () => {
      socketReadyRef.current = true;
      joinedGroupsRef.current.clear();
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

    socket.on("noti-onlineList-toMe", (ids: string[]) => {
      setOnlineIds(new Set(ids));
    });

    socket.on("noti-online", (payload: { id: string }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.add(payload.id);
        return next;
      });
    });

    socket.on("noti-offline", (payload: { id: string }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.id);
        return next;
      });
    });

    socket.on("receive-message", (msg: ChatMessageItem) => {
      const openUser = selectedUserRef.current;
      const senderId = msg.senderId ?? msg.sender?.id;
      if (!senderId) return;
      queryClient.setQueryData<ChatMessageItem[]>(
        chatKeys.messages(senderId),
        (prev) => [...(prev || []), msg],
      );

      if (openUser && senderId === openUser.id) {
        // Mark as seen with acknowledgment to avoid race condition on sidebar refresh
        socket.emit("seen-message", { senderId: openUser.id }, () => {
          void queryClient.invalidateQueries({ queryKey: chatKeys.list() });
        });
      } else {
        // Refresh user list if not in open chat (to show unread count)
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      }
    });

    
    // chat 1-1
    socket.on("seen-message", (data: { viewer: any }) => {
      const openUser = selectedUserRef.current;
      if (!openUser) return;
      // Update message status to seen in current 1-1 thread
      queryClient.setQueryData<ChatMessageItem[]>(
        chatKeys.messages(openUser.id),
        (prev) =>
          (prev || []).map((m) => {
            const senderId = m.senderId ?? m.sender?.id;
            if (senderId === data.viewer.id) {
              return m;
            }
            return { ...m, seenBy: [...(m.seenBy || []), data.viewer] };
          }),
      );
    });



    socket.on(
      "receive-group-message",
      (payload: any) => {
        // Map _id từ backend sang id cho frontend
        const msg: GroupMessageItem = {
          ...payload,
        };

        const senderId = msg.senderId || msg.sender?.id;

        // If this message was sent by me, my UI already optimistic-updated and refetched it.
        if (senderId === myId) return;

        // Refresh group list for unread/lastMessage
        void queryClient.invalidateQueries({ queryKey: groupKeys.list() });

        queryClient.setQueryData<GroupMessageItem[]>(
          groupKeys.messages(msg.groupId),
          (prev) => [...(prev || []), msg],
        );

        const openGroup = selectedGroupRef.current;

        // Nếu đang mở đúng group này và người gửi không phải là mình
        if (openGroup && openGroup.id === msg.groupId) {
          if (senderId && senderId !== myId) {
            socket.emit("seen-group-message", {
              groupId: msg.groupId,
            }, () => {
              void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
            });
          }
        } else {
           // Nếu không trong group đang mở thì refresh để hiện unread
           void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        }
      },
    );

    // socket.on(
    //   "user-seen-message",
    //   (data: { messageId: string; seenBy?: string[] }) => {
    //     const openGroup = selectedGroupRef.current;
    //     const groupId = openGroup?.id;
    //     if (!groupId) return;
    //     queryClient.setQueryData<MessageItem[]>(
    //       ["groupMessages", groupId],
    //       (prev) =>
    //         (prev || []).map((m) =>
    //           m.id === data.messageId
    //             ? { ...m, seenBy: data.seenBy || m.seenBy }
    //             : m,
    //         ),
    //     );
    //   },
    // );

    socket.on(
      "seen-group-message",
      (data: { groupId: string; viewerId: string; viewer?: any }) => {
        const openGroup = selectedGroupRef.current;
        if (!openGroup || data.groupId !== openGroup.id) return;

        queryClient.setQueryData<GroupMessageItem[]>(
          groupKeys.messages(data.groupId),
          (prev) =>
            (prev || []).map((m) => {
              const senderId = m.senderId ?? m.sender?.id;
              if (senderId === data.viewerId) return m;

              const seenBy = m.seenBy || [];
              const alreadySeen = seenBy.some(
                (u) => u.id === data.viewerId,
              );
              if (alreadySeen) return m;

              return { ...m, seenBy: [...seenBy, data.viewer] };
            }),
        );
      },
    );

    socket.on(
      "typing-start",
      (data: { senderId: string; senderName?: string }) => {
        const openUser = selectedUserRef.current;
        if (openUser && data.senderId === openUser.id) {
          setTypingUsers((prev) => new Set(prev).add(data.senderId));
        }
      },
    );

    socket.on("typing-stop", (data: { senderId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.senderId);
        return next;
      });
    });

    socket.on(
      "group-typing-start",
      (data: { senderId: string; senderName?: string }) => {
        if (data.senderId === myId) return;
        setGroupTypingText(`${data.senderName || "Ai đó"} đang gõ...`);
      },
    );

    socket.on("group-typing-stop", (data: { senderId: string }) => {
      if (data.senderId === myId) return;
      setGroupTypingText("");
    });

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
      socket.off("noti-onlineList-toMe");
      socket.off("noti-online");
      socket.off("noti-offline");
      socket.off("receive-message");
      socket.off("receive-group-message");
      socket.off("user-seen-message");
      socket.off("typing-start");
      socket.off("typing-stop");
      socket.off("group-typing-start");
      socket.off("group-typing-stop");
      socket.off("reload-groups");
      socket.off("seen-message");
      // do not force-disconnect here; AuthStore handles disconnect on logout
      socketRef.current = null;
    };
  }, [myId, queryClient, setOnlineIds, setTypingUsers, setGroupTypingText]);

  // Join all group rooms (like `frontend/src/pages/chat/group.module.js`)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (groupIds.length === 0) return;
    if (!socketReadyRef.current) return;

    groupIds.forEach((groupId) => {
      if (!joinedGroupsRef.current.has(groupId)) {
        socket.emit("join-group", { groupId });
        joinedGroupsRef.current.add(groupId);
      }
    });
  }, [groupIds]);

  return { socketRef };
}
