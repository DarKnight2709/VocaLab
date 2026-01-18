import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { Socket } from "socket.io-client";
import { messageAPI } from "@/api/message.api";
import { groupAPI } from "@/api/group.api";
import { useLogoutMutation, useMeQuery } from "@/features/auth/api/authService";
import useAuthStore from "@/features/auth/stores/authStore";
import { EditProfileDialog } from "@/features/auth/components/EditProfileDialog";
import { GroupCreateDialog } from "@/features/chat/components/GroupCreateDialog";
import { GroupInfoDialog } from "@/features/chat/components/GroupInfoDialog";
import { useSocketStore } from "@/shared/stores/useSocketStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, PanelLeftClose, Search, UserRound, UsersRound } from "lucide-react";
import { useSearchUsersQuery } from "@/features/chat/api/chatService";

type AnyUser = {
  _id: string;
  username?: string;
  fullName?: string;
  avatar?: string;
  email?: string;
  unreadCount?: number;
  lastMessage?: {
    isMine?: boolean;
    content?: string;
  };
};

type AnyMessage = {
  _id?: string;
  senderId?: string | { _id: string };
  receiverId?: string;
  groupId?: string;
  content?: string;
  sentAt?: string;
  createdAt?: string;
  seenBy?: string[];
};

type AnyGroup = {
  _id: string;
  name?: string;
  avatar?: string;
  description?: string;
  unreadCount?: number;
  lastMessage?: {
    isMine?: boolean;
    content?: string;
    senderName?: string;
    createdAt?: string;
  };
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type ChatViewProps = {
  embedded?: boolean;
  hideHeader?: boolean;
  hideSidebarSearch?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
};

export default function ChatView({
  embedded = false,
  hideHeader = false,
  hideSidebarSearch = false,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: ChatViewProps) {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const meQuery = useMeQuery();
  // const [meOverride, setMeOverride] = useState<any | null>(null);
  const isAuth = useAuthStore((s) => s.isAuth);
  const [profileOpen, setProfileOpen] = useState(false);

  const me = useMemo(() => {
    // if (meOverride) return meOverride;
    const response = meQuery.data as any;
    return response?.data ?? null;
  }, [meQuery.data]);

  const [users, setUsers] = useState<AnyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const effectiveSearchQuery = externalSearchQuery ?? searchQuery;
  const setEffectiveSearchQuery = (value: string) => {
    onSearchQueryChange?.(value);
    if (externalSearchQuery === undefined) setSearchQuery(value);
  };
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const [groups, setGroups] = useState<AnyGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AnyUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AnyGroup | null>(null);
  const [messages, setMessages] = useState<AnyMessage[]>([]);
  const [groupMessages, setGroupMessages] = useState<AnyMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(false);
  const [messageText, setMessageText] = useState("");

  const [onlineIds, setOnlineIds] = useState<Set<string>>(() => new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(() => new Set());

  const socketRef = useRef<Socket | null>(null);
  const selectedUserRef = useRef<AnyUser | null>(null);
  const selectedGroupRef = useRef<AnyGroup | null>(null);
  const currentGroupIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [groupTypingText, setGroupTypingText] = useState("");

  const myId = useMemo(() => {
    const maybeId = (me?._id || (me as any)?.id) as string | undefined;
    return maybeId || "";
  }, [me]);

  const displayName = useMemo(() => {
    return (me as any)?.fullName || (me as any)?.username || "User";
  }, [me]);

  const { data: searchResults } = useSearchUsersQuery(effectiveSearchQuery);

  const filteredUsers = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return users;
    return searchResults || [];
  }, [users, effectiveSearchQuery, searchResults]);

  const filteredGroups = useMemo(() => {
    if (!effectiveSearchQuery.trim()) return groups;
    const query = effectiveSearchQuery.toLowerCase();
    return groups.filter((g) => (g.name || "").toLowerCase().includes(query));
  }, [groups, effectiveSearchQuery]);

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

    socket.on("receive-message", (msg: AnyMessage) => {
      const openUser = selectedUserRef.current;
      const senderId =
        typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

      if (openUser && senderId === openUser._id) {
        setMessages((prev) => [...prev, msg]);
        // Mark as seen
        socket.emit("seen-message", { senderId: openUser._id });
      }
      // Refresh user list to update unread/lastMessage
      void loadUsers();
    });

    socket.on(
      "receive-group-message",
      (msg: AnyMessage & { groupId: string }) => {
        // Refresh group list for unread/lastMessage
        void loadGroups();

        const openGroup = selectedGroupRef.current;
        if (!openGroup || msg.groupId !== openGroup._id) return;

        setGroupMessages((prev) => [...prev, msg]);

        const senderId =
          typeof msg.senderId === "object"
            ? (msg.senderId as any)?._id
            : msg.senderId;
        if (senderId && senderId !== myId && msg._id) {
          socket.emit("seen-group-message", {
            messageId: msg._id,
            groupId: msg.groupId,
          });
        }
      },
    );

    socket.on(
      "user-seen-message",
      (data: { messageId: string; seenBy?: string[] }) => {
        setGroupMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? { ...m, seenBy: data.seenBy || m.seenBy }
              : m,
          ),
        );
      },
    );

    socket.on(
      "typing-start",
      (data: { senderId: string; senderName?: string }) => {
        const openUser = selectedUserRef.current;
        if (openUser && data.senderId === openUser._id) {
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
      void loadGroups();
    });

    socket.on("seen-message", (data: { viewerId: string; seenAt?: string }) => {
      const openUser = selectedUserRef.current;
      if (openUser && data.viewerId === openUser._id) {
        // Update message status to seen
        setMessages((prev) =>
          prev.map((m) => {
            const senderId =
              typeof m.senderId === "object" ? m.senderId._id : m.senderId;
            if (senderId === myId) {
              return { ...m, seenBy: [...(m.seenBy || []), data.viewerId] };
            }
            return m;
          }),
        );
      }
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
  }, [myId]);

  // If auth state is lost (e.g. token invalid), go back to login.
  useEffect(() => {
    if (embedded) return;
    if (!isAuth) {
      navigate("/login", { replace: true });
    }
  }, [embedded, isAuth, navigate]);

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "groups") {
      void loadGroups();
    }
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, groupMessages.length]);

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
  }, [typingUsers]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await messageAPI.getUsers();
      const list = (res.data as any)?.users || [];
      setUsers(list);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Không thể tải danh sách người dùng",
      );
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadGroups() {
    setLoadingGroups(true);
    try {
      const res = await groupAPI.getGroups();
      const list = (res.data as any)?.groups || [];
      setGroups(list);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể tải danh sách nhóm");
    } finally {
      setLoadingGroups(false);
    }
  }

  async function openChat(user: AnyUser) {
    // Leave active group room if any
    const prevGroupId = currentGroupIdRef.current;
    if (prevGroupId) {
      socketRef.current?.emit("leave-group", prevGroupId);
      currentGroupIdRef.current = null;
    }

    setSelectedGroup(null);
    setGroupMessages([]);
    setGroupTypingText("");

    setSelectedUser(user);
    setLoadingMessages(true);
    setMessages([]);
    try {
      const res = await messageAPI.getMessages(user._id);
      const list = (res.data as any)?.messages || [];
      setMessages(list);

      // Mark seen for 1-1 messages
      socketRef.current?.emit("seen-message", { senderId: user._id });
    } catch (e: any) {
      toast.error("Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function openGroup(group: AnyGroup) {
    setSelectedUser(null);
    setMessages([]);
    setTypingUsers(new Set());

    setSelectedGroup(group);
    setGroupMessages([]);
    setLoadingGroupMessages(true);
    setGroupTypingText("");

    const prevGroupId = currentGroupIdRef.current;
    if (prevGroupId && prevGroupId !== group._id) {
      socketRef.current?.emit("leave-group", prevGroupId);
    }
    currentGroupIdRef.current = group._id;
    socketRef.current?.emit("join-group", group._id);

    try {
      const res = await groupAPI.getGroupMessages(group._id);
      const list = (res.data as any)?.messages || [];
      setGroupMessages(list);

      // Mark seen for received group messages
      for (const m of list as AnyMessage[]) {
        const senderId =
          typeof m.senderId === "object"
            ? (m.senderId as any)?._id
            : m.senderId;
        if (m._id && senderId && senderId !== myId) {
          socketRef.current?.emit("seen-group-message", {
            messageId: m._id,
            groupId: group._id,
          });
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Không thể tải tin nhắn nhóm");
    } finally {
      setLoadingGroupMessages(false);
    }
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  }

  // function handleProfileUpdated removed

  function sendMessage() {
    const socket = socketRef.current;
    const content = messageText.trim();
    if (!socket || !content) return;

    // Group chat
    if (selectedGroup?._id) {
      const groupId = selectedGroup._id;

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
          void loadGroups();
        },
      );
      return;
    }

    // 1-1 chat
    const receiverId = selectedUser?._id;
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
        setMessages((prev) => [
          ...prev,
          {
            _id: `local-${Date.now()}`,
            senderId: myId,
            receiverId,
            content,
            createdAt: new Date().toISOString(),
          },
        ]);
        setMessageText("");
        void loadUsers();
      },
    );
  }

  function handleTyping() {
    const socket = socketRef.current;
    if (!socket) return;

    if (selectedGroup?._id) {
      const groupId = selectedGroup._id;
      socket.emit("group-typing-start", { groupId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("group-typing-stop", { groupId });
      }, 1000);
      return;
    }

    const receiverId = selectedUser?._id;
    if (!receiverId) return;

    socket.emit("typing-start", { receiverId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { receiverId });
    }, 1000);
  }

  const selectedUserDisplayName = selectedUser
    ? selectedUser.fullName || selectedUser.username || "User"
    : "Chọn người để chat";

  const isSelectedUserOnline = selectedUser
    ? onlineIds.has(selectedUser._id)
    : false;
  const isEmbeddedChatView = embedded && (!!selectedUser || !!selectedGroup);

  function handleBackToList() {
    if (selectedGroup?._id) {
      socketRef.current?.emit("leave-group", selectedGroup._id);
      currentGroupIdRef.current = null;
    }

    setSelectedUser(null);
    setSelectedGroup(null);
    setMessages([]);
    setGroupMessages([]);
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
      {!hideHeader && (
        <>
          {/* Header */}
          <header className="border-b bg-primary text-primary-foreground px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">💬 Real Time Chat</h1>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => setProfileOpen(true)}>
                  <Avatar className="h-10 w-10 border border-primary-foreground/30">
                    <AvatarImage src={(me as any)?.avatar} />
                    <AvatarFallback className="text-primary bg-primary-foreground">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          </header>

          <EditProfileDialog
            open={profileOpen}
            onOpenChange={setProfileOpen}
            me={me}
            onLogout={handleLogout}
          />
        </>
      )}

      <GroupCreateDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreated={({ groupId, memberIds }) => {
          socketRef.current?.emit("group-created", {
            groupId,
            members: memberIds,
          });
          setActiveTab("groups");
          void loadGroups();
        }}
      />

      <GroupInfoDialog
        open={groupInfoOpen}
        onOpenChange={setGroupInfoOpen}
        groupId={selectedGroup?._id || null}
        myId={myId}
        onAddedMembers={(memberIds) => {
          const groupId = selectedGroup?._id;
          if (!groupId) return;
          // Notify newly added members to refresh groups
          socketRef.current?.emit("group-created", {
            groupId,
            members: memberIds,
          });
          void loadGroups();
        }}
        onUpdatedGroup={(updated) => {
          setSelectedGroup((prev) =>
            prev && prev._id === updated._id ? { ...prev, ...updated } : prev,
          );
          void loadGroups();
        }}
        onLeftGroup={({ groupId, memberIds }) => {
          // Notify all members to refresh groups
          socketRef.current?.emit("group-deleted", {
            groupId,
            members: memberIds,
          });

          // Leave room & reset UI
          socketRef.current?.emit("leave-group", groupId);
          currentGroupIdRef.current = null;
          setSelectedGroup(null);
          setGroupMessages([]);
          setGroupTypingText("");
          void loadGroups();
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarVisible && (!embedded || !isEmbeddedChatView) && (
          <aside
            className={
              (embedded ? "w-full " : "w-80 ") +
              "border-r bg-card flex flex-col"
            }
          >
            {!embedded && (
              <div className="p-2 border-b flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarVisible(false)}
                  aria-label="Ẩn thanh bên"
                  title="Ẩn thanh bên"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </Button>
              </div>
            )}

            {!hideSidebarSearch && (
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={effectiveSearchQuery}
                    onChange={(e) => setEffectiveSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "users" | "groups")}
              className="flex-1 flex flex-col"
            >
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    Người dùng
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="gap-2">
                    <UsersRound className="h-4 w-4" />
                    Nhóm
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="users"
                className="flex-1 overflow-auto overscroll-contain p-2 m-0"
              >
                {loadingUsers ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Đang tải...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    {effectiveSearchQuery
                      ? "Không tìm thấy người dùng"
                      : "Không có người dùng nào"}
                  </div>
                ) : (
                  filteredUsers.map((u: AnyUser) => {
                    const name = u.fullName || u.username || "User";
                    const active = selectedUser?._id === u._id;
                    const online = onlineIds.has(u._id);
                    const unread = u.unreadCount || 0;

                    return (
                      <button
                        key={u._id}
                        className={`w-full text-left rounded-lg p-3 mb-2 transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => void openChat(u)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback>
                                {getInitials(name)}
                              </AvatarFallback>
                            </Avatar>
                            {online && (
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate">{name}</div>
                              {unread > 0 && !active && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-xs truncate ${active ? "opacity-90" : "text-muted-foreground"}`}
                            >
                              {u.lastMessage
                                ? `${u.lastMessage.isMine ? "Bạn: " : ""}${u.lastMessage.content?.slice(0, 30)}${u.lastMessage.content && u.lastMessage.content.length > 30 ? "..." : ""}`
                                : `@${u.username || ""}`}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent
                value="groups"
                className="flex-1 overflow-auto overscroll-contain p-2 m-0"
              >
                <div className="px-2 pt-2 pb-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    + Tạo nhóm
                  </Button>
                </div>

                {loadingGroups ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Đang tải...
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    {effectiveSearchQuery
                      ? "Không tìm thấy nhóm"
                      : "Bạn chưa có nhóm nào"}
                  </div>
                ) : (
                  filteredGroups.map((g) => {
                    const name = g.name || "Nhóm";
                    const active = selectedGroup?._id === g._id;
                    const unread = g.unreadCount || 0;
                    const last = g.lastMessage;
                    const preview = last?.content
                      ? `${last.senderName ? `${last.senderName}: ` : ""}${last.content.slice(0, 30)}${last.content.length > 30 ? "..." : ""}`
                      : g.description || "";

                    return (
                      <button
                        key={g._id}
                        className={`w-full text-left rounded-lg p-3 mb-2 transition-colors ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => void openGroup(g)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={g.avatar} />
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium truncate">{name}</div>
                              {unread > 0 && !active && (
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-5 text-center">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-xs truncate ${active ? "opacity-90" : "text-muted-foreground"}`}
                            >
                              {preview}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </aside>
        )}

        {/* Floating bubble button when sidebar is hidden */}
        {!embedded && !isSidebarVisible && (
          <Button
            type="button"
            onClick={() => setIsSidebarVisible(true)}
            className="fixed right-4 bottom-24 z-50 h-12 w-12 rounded-full shadow-lg"
            aria-label="Hiện thanh bên"
            title="Hiện thanh bên"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        )}

        {/* Chat Area */}
        {(!embedded || isEmbeddedChatView) && (
          <main className="flex-1 flex flex-col">
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
              <>
                {/* Chat Header */}
                <div className="border-b p-4 bg-card">
                  <div className="flex items-center gap-3">
                    {embedded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToList}
                        aria-label="Quay lại danh sách"
                        title="Quay lại"
                        className="shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    {selectedGroup ? (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedGroup.avatar} />
                          <AvatarFallback>
                            {getInitials(selectedGroup.name || "Nhóm")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {selectedGroup.name || "Nhóm"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {groupTypingText || selectedGroup.description || ""}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setGroupInfoOpen(true)}
                          aria-label="Xem thông tin nhóm"
                          title="Thông tin nhóm"
                        >
                          ...
                        </Button>
                      </>
                    ) : (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedUser?.avatar} />
                          <AvatarFallback>
                            {getInitials(selectedUserDisplayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">
                              {selectedUserDisplayName}
                            </div>
                            {isSelectedUserOnline && (
                              <div className="h-2 w-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {isSelectedUserOnline
                              ? "Đang hoạt động"
                              : "Không hoạt động"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto overscroll-contain p-4 space-y-3 bg-muted/30">
                  {selectedGroup ? (
                    loadingGroupMessages ? (
                      <div className="text-center text-muted-foreground">
                        Đang tải tin nhắn...
                      </div>
                    ) : groupMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        Chưa có tin nhắn nào
                      </div>
                    ) : (
                      groupMessages.map((m) => {
                        const senderId =
                          typeof m.senderId === "object"
                            ? (m.senderId as any)?._id
                            : m.senderId;
                        const senderName =
                          typeof m.senderId === "object"
                            ? (m.senderId as any)?.fullName ||
                              (m.senderId as any)?.username
                            : "";
                        const isMine = senderId === myId;
                        const seenCount = Math.max(
                          0,
                          ((m.seenBy || []).length || 1) - 1,
                        );

                        return (
                          <div
                            key={
                              m._id ||
                              `${senderId}-${m.createdAt}-${Math.random()}`
                            }
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                            >
                              {!isMine && (
                                <div className="text-xs text-muted-foreground px-2">
                                  {senderName || "Thành viên"}
                                </div>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border"
                                }`}
                              >
                                {m.content}
                              </div>
                              <div className="text-xs text-muted-foreground px-2">
                                {formatTime(
                                  m.createdAt || m.sentAt || new Date(),
                                )}
                                {isMine && (
                                  <span className="ml-1">
                                    {seenCount > 0 ? `✓ ${seenCount}` : "✓"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )
                  ) : loadingMessages ? (
                    <div className="text-center text-muted-foreground">
                      Đang tải tin nhắn...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      Chưa có tin nhắn nào
                    </div>
                  ) : (
                    messages.map((m) => {
                      const senderId =
                        typeof m.senderId === "object"
                          ? m.senderId._id
                          : m.senderId;
                      const isMine = senderId === myId;
                      const selectedUserId = selectedUser?._id;
                      const isSeen = selectedUserId
                        ? m.seenBy?.includes(selectedUserId) || false
                        : false;

                      return (
                        <div
                          key={
                            m._id ||
                            `${senderId}-${m.createdAt}-${Math.random()}`
                          }
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card border"
                              }`}
                            >
                              {m.content}
                            </div>
                            <div className="text-xs text-muted-foreground px-2">
                              {formatTime(
                                m.createdAt || m.sentAt || new Date(),
                              )}
                              {isMine && (
                                <span className="ml-1">
                                  {isSeen ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {!selectedGroup && typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-lg px-4 py-2 text-sm text-muted-foreground">
                        Đang nhập...
                      </div>
                    </div>
                  )}
                  {selectedGroup && !!groupTypingText && (
                    <div className="flex justify-start">
                      <div className="bg-card border rounded-lg px-4 py-2 text-sm text-muted-foreground">
                        {groupTypingText}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4 bg-card">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageText.trim()}
                    >
                      Gửi
                    </Button>
                  </div>
                </div>
              </>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
