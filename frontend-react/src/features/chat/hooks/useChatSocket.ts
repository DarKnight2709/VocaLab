import { useEffect, useMemo, useRef } from "react";
import type { Socket } from "socket.io-client";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import type { UserItem, MessageItem } from "@/shared/validations/ChatSchema";
import type { GroupItem } from "@/shared/validations/GroupSchema";
import { useQueryClient } from "@tanstack/react-query";

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

  const groupIds = useMemo(() => groups.map((g) => g.id).filter(Boolean), [groups]);

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

    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("entering");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
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

    socket.on("receive-message", (msg: MessageItem) => {
      const openUser = selectedUserRef.current;
      const senderId =
        typeof msg.senderId === "object" ? msg.senderId.id : msg.senderId;

      if (openUser && senderId === openUser.id) {
        queryClient.setQueryData<MessageItem[]>(
          ["messages", openUser.id],
          (prev) => [...(prev || []), msg],
        );
        // Mark as seen
        socket.emit("seen-message", { senderId: openUser.id });
      }
      // Refresh user list to update unread/lastMessage
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    });

    socket.on(
      "receive-group-message",
      (msg: MessageItem & { groupId: string }) => {
        // Refresh group list for unread/lastMessage
        void queryClient.invalidateQueries({ queryKey: ["groups"] });

        const openGroup = selectedGroupRef.current;
        if (!openGroup || msg.groupId !== openGroup.id) return;

        queryClient.setQueryData<MessageItem[]>(
          ["groupMessages", msg.groupId],
          (prev) => [...(prev || []), msg],
        );

        const senderId =
          typeof msg.senderId === "object"
            ? (msg.senderId as any)?.id
            : msg.senderId;
        if (senderId && senderId !== myId && msg.id) {
          socket.emit("seen-group-message", {
            messageId: msg.id,
            groupId: msg.groupId,
          });
        }
      },
    );

    socket.on(
      "user-seen-message",
      (data: { messageId: string; seenBy?: string[] }) => {
        const openGroup = selectedGroupRef.current;
        const groupId = openGroup?.id;
        if (!groupId) return;
        queryClient.setQueryData<MessageItem[]>(
          ["groupMessages", groupId],
          (prev) =>
            (prev || []).map((m) =>
              m.id === data.messageId
                ? { ...m, seenBy: data.seenBy || m.seenBy }
                : m,
            ),
        );
      },
    );

    socket.on(
      "group-messages-seen",
      (data: { groupId: string; userId: string; user?: any }) => {
        const openGroup = selectedGroupRef.current;
        if (!openGroup || data.groupId !== openGroup.id) return;

        queryClient.setQueryData<MessageItem[]>(
          ["groupMessages", data.groupId],
          (prev) =>
            (prev || []).map((m) => {
               const senderIdStr = typeof m.senderId === 'object' ? m.senderId.id : m.senderId;
               if (senderIdStr === data.userId) return m;
               
               const seenBy = m.seenBy || [];
               const alreadySeen = seenBy.some(u => (typeof u === 'string' ? u : u.id) === data.userId);
               if (alreadySeen) return m;
               
               return { ...m, seenBy: [...seenBy, data.user || data.userId] };
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

    socket.on("reload-groups", () => {
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    });

    socket.on("seen-message", (data: { viewerId: string; seenAt?: string }) => {
      const openUser = selectedUserRef.current;
      if (!openUser) return;
      // Update message status to seen in current 1-1 thread
      queryClient.setQueryData<MessageItem[]>(
        ["messages", openUser.id],
        (prev) =>
          (prev || []).map((m) => {
            const senderId =
              typeof m.senderId === "object" ? m.senderId.id : m.senderId;
            if (senderId === myId) {
              return { ...m, seenBy: [...(m.seenBy || []), data.viewerId] };
            }
            return m;
          }),
      );
    });

    return () => {
      socket.off("connect");
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
  }, [
    myId,
    queryClient,
    setOnlineIds,
    setTypingUsers,
    setGroupTypingText,
  ]);

  // Join all group rooms (like `frontend/src/pages/chat/group.module.js`)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (groupIds.length === 0) return;
    groupIds.forEach((groupId) => {
      socket.emit("join-group", { groupId });
    });
  }, [groupIds]);

  return { socketRef };
}


