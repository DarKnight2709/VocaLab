import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { GroupCreateDialog } from "@/features/chat/components/GroupCreateDialog";
import { GroupInfoDialog } from "@/features/chat/components/GroupInfoDialog";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatArea } from "@/features/chat/components/ChatArea";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useGroupsQuery } from "@/features/chat/api/groupService";
import { useGroupMessagesQuery } from "@/features/chat/api/groupService";
import { useUsersQuery } from "@/features/chat/api/chatService";
import { useMessagesQuery } from "@/features/chat/api/chatService";

import type { ChatViewProps } from "../types";
import type { UserItem, MessageItem } from "@/shared/validations/ChatSchema";
import type { GroupItem } from "@/shared/validations/GroupSchema";

export default function ChatView({
  me,
  embedded = false,
  hideHeader = false,
  hideSidebarSearch = false,
}: ChatViewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local UI state (no fetching here)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [messageText, setMessageText] = useState("");
  const [onlineIds, setOnlineIds] = useState<Set<string>>(() => new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(() => new Set());
  const [groupTypingText, setGroupTypingText] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [searchQuery, setSearchQuery] = useState("");


  // tránh spam event typing-start
  // auto stop sau 1s
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  


  // Queries
  const { data: users = [], isLoading: loadingUsers } = useUsersQuery();
  const { data: groups = [], isLoading: loadingGroups } = useGroupsQuery();
  const { data: messages = [], isLoading: loadingMessages } = useMessagesQuery(
    selectedUser?.id || "",
  );
  const { data: groupMessages = [], isLoading: loadingGroupMessages } =
    useGroupMessagesQuery(selectedGroup?.id || "");


  // Nếu có search query thì lấy user theo search query, nếu không thì lấy tất cả user
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.fullName || ""}`.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);


  // Nếu có search query thì lấy group theo search query, nếu không thì lấy tất cả group
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g.name || "").toLowerCase().includes(q));
  }, [groups, searchQuery]);


  const { socketRef } = useChatSocket({
    myId: me!.id,
    selectedUser,
    selectedGroup,
    groups,
    setOnlineIds,
    setTypingUsers,
    setGroupTypingText,
  });

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const isEmbeddedChatView = embedded && (!!selectedUser || !!selectedGroup);

  // If auth state is lost (e.g. token invalid), go back to login.
  useEffect(() => {
    if (embedded) return;
  }, [embedded, navigate]);

  // Khi chuyển sang tab groups thì invalid các query liên quan đến groups
  useEffect(() => {
    if (activeTab === "groups") {
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    }
  }, [activeTab, queryClient]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (typingUsers.size > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(new Set());
      }, 3000);
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [typingUsers, typingTimeoutRef, setTypingUsers]);

  // reset state group
  // mark seen ngay
  // Invalidate messages + users
  async function openChat(user: UserItem) {
    // Don't leave group (like frontend) - keep joined to receive notifications

    setSelectedGroup(null);
    setGroupTypingText("");

    setSelectedUser(user);
    try {
      // Mark seen for 1-1 messages
      socketRef.current?.emit("seen-message", { senderId: user.id });
      void queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      toast.error("Không thể tải tin nhắn");
    }
  }

  // Không leave group cũ → vẫn nhận notification
  // Join idempotent → server ignore duplicate
  async function openGroup(group: GroupItem) {
    setSelectedUser(null);
    setTypingUsers(new Set());

    setSelectedGroup(group);
    setGroupTypingText("");

    // Join group room (no need to leave previous, like frontend)
    // All groups are joined by `useChatSocket` when groups list changes
    socketRef.current?.emit("seen-group-message", { groupId: group.id });

    try {
      void queryClient.invalidateQueries({
        queryKey: ["groupMessages", group.id],
      });
      void queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể tải tin nhắn nhóm");
    }
  }

  function sendMessage() {
    const socket = socketRef.current;
    const content = messageText.trim();
    if (!socket || !content) return;

    // Group chat
    if (selectedGroup?.id) {
      const groupId = selectedGroup.id;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("group-typing-stop", { groupId });

      socket.emit(
        "send-group-message",
        { groupId, content, replyTo: null, fileUrl: null },
        (status: { success: boolean; message?: string }) => {
          if (!status?.success) {
            toast.error(status?.message || "Gửi tin nhắn nhóm thất bại");
            return;
          }
          setMessageText("");
          void queryClient.invalidateQueries({ queryKey: ["groups"] });
          void queryClient.invalidateQueries({
            queryKey: ["groupMessages", groupId],
          });
        },
      );
      return;
    }

    // 1-1 chat
    const receiverId = selectedUser?.id;
    if (!receiverId) return;

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing-stop", { receiverId });

    socket.emit(
      "send-message",
      { receiverId, content },
      (status: { success: boolean; message?: string }) => {
        if (!status?.success) {
          toast.error(status?.message || "Gửi tin nhắn thất bại");
          return;
        }
        // Optimistic update
        queryClient.setQueryData<MessageItem[]>(
          ["messages", receiverId],
          (prev) => [
            ...(prev || []),
            {
              id: `local-${Date.now()}`,
              senderId: me!.id,
              receiverId,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        );
        setMessageText("");
        void queryClient.invalidateQueries({ queryKey: ["users"] });
      },
    );
  }

  function handleTyping() {
    const socket = socketRef.current;
    if (!socket) return;

    if (selectedGroup?.id) {
      const groupId = selectedGroup.id;
      socket.emit("group-typing-start", { groupId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("group-typing-stop", { groupId });
      }, 1000);
      return;
    }

    const receiverId = selectedUser?.id;
    if (!receiverId) return;

    socket.emit("typing-start", { receiverId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { receiverId });
    }, 1000);
  }

  const isSelectedUserOnline = selectedUser
    ? onlineIds.has(selectedUser.id)
    : false;

  function handleBackToList() {
    // Don't leave group (like frontend) - keep joined to receive notifications

    setSelectedUser(null);
    setSelectedGroup(null);
    setGroupTypingText("");
    setMessageText("");
  }

  return (
    <div
      className={
        embedded
          ? "h-full flex flex-col bg-background"
          : "h-dvh flex flex-col bg-background"
      }
    >
      <GroupCreateDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreated={({ groupId, memberIds }) => {
          socketRef.current?.emit("group-created", {
            groupId,
            members: memberIds,
          });
          setActiveTab("groups");
          void queryClient.invalidateQueries({ queryKey: ["groups"] });
        }}
      />

      <GroupInfoDialog
        open={groupInfoOpen}
        onOpenChange={setGroupInfoOpen}
        groupId={selectedGroup?.id || null}
        myId={me!.id}
        onAddedMembers={(memberIds) => {
          const groupId = selectedGroup?.id;
          if (!groupId) return;
          // Notify newly added members to refresh groups
          socketRef.current?.emit("group-created", {
            groupId,
            members: memberIds,
          });
          void queryClient.invalidateQueries({ queryKey: ["groups"] });
        }}
        onUpdatedGroup={(updated) => {
          setSelectedGroup((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
          );
          void queryClient.invalidateQueries({ queryKey: ["groups"] });
        }}
        onLeftGroup={({ groupId, memberIds }) => {
          // Notify all members to refresh groups
          socketRef.current?.emit("group-deleted", {
            groupId,
            members: memberIds,
          });

          // Leave room & reset UI
          socketRef.current?.emit("leave-group", groupId);
          setSelectedGroup(null);
          setGroupTypingText("");
          void queryClient.invalidateQueries({ queryKey: ["groups"] });
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          embedded={embedded}
          hideSidebarSearch={hideSidebarSearch}
          isSidebarVisible={isSidebarVisible}
          onSidebarVisibilityChange={setIsSidebarVisible}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          filteredUsers={filteredUsers}
          filteredGroups={filteredGroups}
          loadingUsers={loadingUsers}
          loadingGroups={loadingGroups}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          onlineIds={onlineIds}
          onUserClick={openChat}
          onGroupClick={openGroup}
          onCreateGroupClick={() => setCreateGroupOpen(true)}
        />

        {/* Chat Area */}
        {(!embedded || isEmbeddedChatView) && (
          <main className="flex-1 flex flex-col min-h-0">
            {!selectedUser && !selectedGroup ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg text-muted-foreground">
                    Chọn một người dùng hoặc nhóm để bắt đầu chat
                  </p>
                </div>
              </div>
            ) : (
              <ChatArea
                hideHeader={hideHeader}
                embedded={embedded}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                isSelectedUserOnline={isSelectedUserOnline}
                groupTypingText={groupTypingText}
                typingUsersCount={typingUsers.size}
                messages={messages}
                groupMessages={groupMessages}
                loadingMessages={loadingMessages}
                loadingGroupMessages={loadingGroupMessages}
                myId={me!.id}
                messageText={messageText}
                onMessageTextChange={setMessageText}
                onTyping={handleTyping}
                onSend={sendMessage}
                onBackToList={handleBackToList}
                onOpenGroupInfo={() => setGroupInfoOpen(true)}
              />
            )}
          </main>
        )}
      </div>
    </div>
  );
}
