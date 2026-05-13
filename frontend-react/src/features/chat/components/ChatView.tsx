import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/lib/api";

import { GroupCreateDialog } from "@/features/chat/components/GroupCreateDialog";
import { GroupInfoDialog } from "@/features/chat/components/GroupInfoDialog";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { ChatArea } from "@/features/chat/components/ChatArea";
import { CallOverlay } from "@/features/chat/components/CallOverlay";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";
import { useVoiceCall } from "@/features/chat/hooks/useVoiceCall";
import { useGroupsQuery, groupKeys } from "@/features/chat/api/groupService";
import { useGroupMessagesQuery } from "@/features/chat/api/groupService";
import { useUsersQuery, chatKeys } from "@/features/chat/api/chatService";
import { useMessagesQuery } from "@/features/chat/api/chatService";
import { useUploadFilesMutation } from "@/shared/hooks/useUpload";

import { useTranslation } from "@/shared/hooks/useTranslation";
import type { ChatViewProps } from "../types";
import type {
  UserItem,
  ChatMessageItem,
} from "@/shared/validations/ChatSchema";
import { MessageType } from "@/shared/enums/MessageType.enum";
import type {
  GroupItem,
  GroupMessageItem,
} from "@/shared/validations/GroupSchema";

export default function ChatView({
  me,
  embedded = false,
  hideHeader = false,
  hideSidebarSearch = false,
}: ChatViewProps) {
  const { t } = useTranslation();
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

  const uploadFilesMutation = useUploadFilesMutation();

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
    return users.filter((u) => `${u.fullName || ""}`.toLowerCase().includes(q));
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

  const voiceCall = useVoiceCall(socketRef);

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
      void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
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
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(user.id),
      });
      void queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    } catch (e: any) {
      toast.error(getErrorMessage(e, t('chat.loadMessagesFailed')));
    }
  }

  // Không leave group cũ → vẫn nhận notification
  // Join idempotent → server ignore duplicate
  async function openGroup(group: GroupItem) {
    setSelectedUser(null);
    setTypingUsers(new Set());

    setSelectedGroup(group);
    setGroupTypingText("");

    try {
      // Join group room (no need to leave previous, like frontend)
      // All groups are joined by `useChatSocket` when groups list changes
      socketRef.current?.emit(
        "seen-group-message",
        { groupId: group.id },
        () => {
          void queryClient.invalidateQueries({
            queryKey: groupKeys.messages(group.id),
          });
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        },
      );
    } catch (e: any) {
      toast.error(getErrorMessage(e, t('chat.loadMessagesFailed')));
    }
  }

  async function sendMessage(
    files: File[] = [],
    gifs: { url: string; name: string }[] = [],
  ) {
    const socket = socketRef.current;
    const content = messageText.trim();
    if (!socket || (!content && files.length === 0 && gifs.length === 0))
      return;

    let attachments: any[] = [];

    // 1. Attach GIFs directly without uploading
    if (gifs.length > 0) {
      attachments.push(
        ...gifs.map((g) => ({
          url: g.url,
          type: "image",
          name: g.name,
          mimeType: "image/gif",
          size: 0,
        })),
      );
    }

    // 2. Upload actual files — show optimistic uploading message during upload
    if (files.length > 0) {
      const uploadingId = `uploading-${Date.now()}`;
      const uploadingAttachments = files.map((f) => ({
        url: "",
        type: f.type.startsWith("image/")
          ? "image"
          : f.type.startsWith("video/")
            ? "video"
            : "file",
        name: f.name,
        mimeType: f.type,
        size: f.size,
        _uploading: true,
      }));

      // Add optimistic uploading message to cache
      if (selectedGroup?.id) {
        const groupId = selectedGroup.id;
        queryClient.setQueryData<GroupMessageItem[]>(
          groupKeys.messages(groupId),
          (prev) => [
            ...(prev || []),
            {
              id: uploadingId,
              senderId: me!.id,
              sender: {
                id: me!.id,
                username: me!.username,
                fullName: me!.fullName,
                avatar: me!.avatar,
              },
              groupId,
              content: content || "",
              attachments: uploadingAttachments,
              createdAt: new Date().toISOString(),
              type: MessageType.GROUP,
              seenBy: [],
              _uploading: true,
            } as any,
          ],
        );
      } else if (selectedUser?.id) {
        queryClient.setQueryData<ChatMessageItem[]>(
          chatKeys.messages(selectedUser.id),
          (prev) => [
            ...(prev || []),
            {
              id: uploadingId,
              senderId: me!.id,
              receiverId: selectedUser.id,
              content: content || "",
              attachments: uploadingAttachments,
              createdAt: new Date().toISOString(),
              type: MessageType.DIRECT,
              isSeen: false,
              _uploading: true,
            } as any,
          ],
        );
      }

      // Clear input immediately so user sees responsiveness
      setMessageText("");

      try {
        const uploaded = await uploadFilesMutation.mutateAsync(files);
        attachments = [...attachments, ...uploaded];
      } catch (e) {
        // Remove optimistic message on failure
        if (selectedGroup?.id) {
          queryClient.setQueryData<GroupMessageItem[]>(
            groupKeys.messages(selectedGroup.id),
            (prev) => (prev || []).filter((m) => m.id !== uploadingId),
          );
        } else if (selectedUser?.id) {
          queryClient.setQueryData<ChatMessageItem[]>(
            chatKeys.messages(selectedUser.id),
            (prev) => (prev || []).filter((m) => m.id !== uploadingId),
          );
        }
        toast.error(t('chat.uploadFilesFailed'));
        return;
      }

      // Remove optimistic message (real one will be added after socket ack)
      if (selectedGroup?.id) {
        queryClient.setQueryData<GroupMessageItem[]>(
          groupKeys.messages(selectedGroup.id),
          (prev) => (prev || []).filter((m) => m.id !== uploadingId),
        );
      } else if (selectedUser?.id) {
        queryClient.setQueryData<ChatMessageItem[]>(
          chatKeys.messages(selectedUser.id),
          (prev) => (prev || []).filter((m) => m.id !== uploadingId),
        );
      }
    }

    // If no attachments, make it undefined to match original logic optionally
    const finalAttachments = attachments.length > 0 ? attachments : undefined;

    // Group chat
    if (selectedGroup?.id) {
      const groupId = selectedGroup.id;

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("group-typing-stop", { groupId });

      socket.emit(
        "send-group-message",
        {
          groupId,
          content,
          type: MessageType.GROUP,
          replyTo: null,
          attachments: finalAttachments,
        },
        (status: { success: boolean; message?: string }) => {
          if (!status?.success) {
            toast.error(status?.message || t('chat.sendMessageFailed'));
            return;
          }
          setMessageText("");
          queryClient.setQueryData<GroupMessageItem[]>(
            groupKeys.messages(groupId),
            (prev) => [
              ...(prev || []),
              {
                id: `local-${Date.now()}`,
                senderId: me!.id,
                sender: {
                  id: me!.id,
                  username: me!.username,
                  fullName: me!.fullName,
                  avatar: me!.avatar,
                },
                groupId,
                content: content || "",
                attachments: finalAttachments,
                createdAt: new Date().toISOString(),
                type: MessageType.GROUP,
                seenBy: [],
              },
            ],
          );
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        },
      );
      return;
    }

    // 1-1 chat
    const receiverId = selectedUser?.id;
    if (!receiverId) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("typing-stop", { receiverId });

    socket.emit(
      "send-message",
      {
        receiverId,
        content,
        type: MessageType.DIRECT,
        attachments: finalAttachments,
      },
      (status: { success: boolean; message?: string }) => {
        if (!status?.success) {
          toast.error(status?.message || t('chat.sendMessageFailed'));
          return;
        }
        setMessageText("");
        queryClient.setQueryData<ChatMessageItem[]>(
          chatKeys.messages(receiverId),
          (prev) => [
            ...(prev || []),
            {
              id: `local-${Date.now()}`,
              senderId: me!.id,
              receiverId,
              content: content || "",
              attachments: finalAttachments,
              createdAt: new Date().toISOString(),
              type: MessageType.DIRECT,
              isSeen: false,
            },
          ],
        );
        void queryClient.invalidateQueries({
          queryKey: chatKeys.messages(receiverId),
        });
        void queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      },
    );
  }

  function handleEmojiClick(emoji: string) {
    setMessageText((prev) => prev + emoji);
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

  const isSelectedUserOnline = useMemo(() => {
    if (selectedUser) {
      return onlineIds.has(selectedUser.id);
    }
    if (selectedGroup) {
      return (selectedGroup.members || []).some(
        (memberId) => memberId !== me!.id && onlineIds.has(memberId),
      );
    }
    return false;
  }, [selectedUser, selectedGroup, onlineIds, me]);

  function recallMessage(messageId: string) {
    const socket = socketRef.current;
    const content = messageText.trim();
    if (!socket || !content) return;

    if (selectedGroup?.id) {
      const groupId = selectedGroup.id;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("group-typing-stop", { groupId });

      socket.emit(
        "send-group-message",
        {
          groupId,
          content,
          type: MessageType.GROUP,
          replyTo: null,
          fileUrl: null,
        },
        (status: { success: boolean; message?: string }) => {
          if (!status?.success) {
            toast.error(status?.message || t('chat.sendMessageFailed'));
            return;
          }
          setMessageText("");
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
          void queryClient.invalidateQueries({
            queryKey: groupKeys.messages(groupId),
          });
        },
      );
      return;
    }

    socket.emit(
      "recall-message",
      { messageId },
      (status: { success: boolean; message?: string }) => {
        if (!status?.success) {
          toast.error(status?.message || t('chat.recallMessageFailed'));
          return;
        }
        queryClient.invalidateQueries({ queryKey: chatKeys.list() });
      },
    );
  }

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
          : "h-full flex flex-col bg-background"
      }
    >
      <GroupCreateDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreated={() => {
          setActiveTab("groups");
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        }}
      />

      <GroupInfoDialog
        open={groupInfoOpen}
        onOpenChange={setGroupInfoOpen}
        groupId={selectedGroup?.id || null}
        myId={me!.id}
        onAddedMembers={() => {
          const groupId = selectedGroup?.id;
          if (!groupId) return;
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        }}
        onUpdatedGroup={(updated) => {
          setSelectedGroup((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev,
          );
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
        }}
        onLeftGroup={() => {
          setSelectedGroup(null);
          setGroupTypingText("");
          void queryClient.invalidateQueries({ queryKey: groupKeys.list() });
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
          myId={me!.id}
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
                  <p className="text-lg text-muted-foreground">
                    {t('chat.chooseToStart')}
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
                onEmojiClick={handleEmojiClick}
                onBackToList={handleBackToList}
                onOpenGroupInfo={() => setGroupInfoOpen(true)}
                onCallClick={
                  selectedUser && !selectedGroup
                    ? () =>
                        voiceCall.startCall(
                          selectedUser.id,
                          selectedUser.fullName ||
                            selectedUser.username ||
                            t('chat.user'),
                          selectedUser.avatar || undefined,
                        )
                    : undefined
                }
              />
            )}
          </main>
        )}
      </div>

      {/* Voice Call Overlay */}
      <CallOverlay
        callState={voiceCall.callState}
        peerName={voiceCall.peerName}
        peerAvatar={voiceCall.peerAvatar}
        isMuted={voiceCall.isMuted}
        callDuration={voiceCall.callDuration}
        onAccept={voiceCall.acceptCall}
        onReject={voiceCall.rejectCall}
        onEnd={voiceCall.endCall}
        onToggleMute={voiceCall.toggleMute}
      />

      {/* Hidden audio element for remote stream */}
      <audio ref={voiceCall.remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
