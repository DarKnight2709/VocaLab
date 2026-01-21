import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { getInitials } from "../utils";
import type { UserItem, MessageItem } from "@/shared/validations/ChatSchema";
import type { GroupItem } from "@/shared/validations/GroupSchema";

type MessageListProps = {
  selectedGroup: GroupItem | null;
  messages: MessageItem[];
  groupMessages: MessageItem[];
  loadingMessages: boolean;
  loadingGroupMessages: boolean;
  selectedUser: UserItem | null;
  myId: string;
};

export function MessageList({
  selectedGroup,
  messages,
  groupMessages,
  loadingMessages,
  loadingGroupMessages,
  selectedUser,
  myId,
}: MessageListProps) {
  const [openSeenListId, setOpenSeenListId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const normalizeId = (id: any): string => {
    if (!id) return "";
    if (typeof id === "object" && "id" in id) {
      return String((id as any).id);
    }
    return String(id);
  };

  const formatHoverDateTime = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    if (isToday) return time;

    const dateStr = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${dateStr} ${time}`;
  };

  const formatTimeLabel = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    if (isToday) return time;

    const dateStr = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${dateStr} ${time}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, groupMessages.length]);

  // Chỉ áp dụng cho 1-1: tìm tin nhắn cuối cùng do tôi gửi
  const lastMyMessageIndex = (() => {
    const myIdNorm = normalizeId(myId);
    let idx = -1;
    messages.forEach((m, i) => {
      if (normalizeId(m.senderId) === myIdNorm) idx = i;
    });
    return idx;
  })();

  return (
    <div className="flex-1 overflow-auto overscroll-contain p-4 space-y-3 bg-muted/30 min-h-0">
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
          groupMessages.map((m, index) => {
            const senderId = normalizeId(m.senderId);
            const senderName =
              typeof m.senderId === "object"
                ? m.senderId?.fullName || m.senderId?.username
                : "";
            const isMine = senderId === normalizeId(myId);
            const currentDate = m.createdAt || new Date();

            const prev = index > 0 ? groupMessages[index - 1] : null;
            const prevDate = prev ? prev.createdAt || new Date() : null;
            const shouldShowTimeLabel =
              !prevDate ||
              new Date(currentDate).getTime() - new Date(prevDate).getTime() >=
                30 * 60 * 1000;

            return (
              <div
                key={m.id || `${senderId}-${m.createdAt}-${Math.random()}`}
                className="space-y-1"
              >
                {shouldShowTimeLabel && (
                  <div className="flex justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                      {formatTimeLabel(currentDate)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
                >
                  {!isMine && (
                    <div className="shrink-0">
                      <Link
                        to={ROUTES.PROFILE.url.replace(
                          ":fullName",
                          senderName || "user",
                        )}
                        className="block rounded-full hover:opacity-80 transition-opacity"
                        aria-label={`Xem trang cá nhân của ${senderName}`}
                      >
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold">
                          {typeof m.senderId === "object" &&
                          (m.senderId as any)?.avatar ? (
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            <img
                              src={(m.senderId as any)?.avatar}
                              alt=""
                              className="h-8 w-8 object-cover"
                            />
                          ) : (
                            getInitials(senderName || "User")
                          )}
                        </div>
                      </Link>
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div className="relative inline-flex items-center group/message">
                      <div
                        className={`rounded-lg px-3 py-1.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border"
                        }`}
                      >
                        {m.content}
                      </div>
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 rounded-md bg-background/95 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm border opacity-0 group-hover/message:opacity-100 max-w-[220px] whitespace-normal wrap-break-word transition-opacity z-10 ${
                          isMine
                            ? "right-full mr-2 text-right"
                            : "left-full ml-2 text-left"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{formatHoverDateTime(currentDate)}</span>
                          {isMine && m.seenBy && m.seenBy.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenSeenListId(openSeenListId === m.id ? null : (m.id || null));
                                }}
                                className="text-primary font-medium hover:underline cursor-pointer transition-all"
                              >
                                Đã xem ({m.seenBy.length})
                              </button>
                              
                              {openSeenListId === m.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenSeenListId(null);
                                    }}
                                  />
                                  <div className={`absolute bottom-full mb-2 ${isMine ? 'right-0' : 'left-0'} bg-card border rounded-xl shadow-xl p-3 z-50 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto`}>
                                    <div className="flex justify-between items-center mb-2 px-1">
                                      <span className="text-xs font-bold text-foreground">Đã xem bởi</span>
                                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{m.seenBy.length}</span>
                                    </div>
                                    <div className="max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                      <ul className="space-y-1.5 text-left">
                                        {m.seenBy.map((user: any, idx: number) => {
                                          const name = typeof user === 'string' ? 'Người dùng' : (user.fullName || user.username);
                                          const avatar = typeof user === 'object' ? user.avatar : null;
                                          return (
                                            <li key={idx} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                                              <div className="h-6 w-6 rounded-full bg-muted overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {avatar ? (
                                                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                  getInitials(name)
                                                )}
                                              </div>
                                              <span className="text-xs font-medium truncate text-foreground/90">{name}</span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
        messages.map((m, index) => {
          const senderId = normalizeId(m.senderId);
          // In 1-1, ưu tiên so sánh với myId; nếu myId chưa sẵn, fallback: tin nhắn của đối phương khi senderId === selectedUser.id
          const isMine = myId
            ? senderId === normalizeId(myId)
            : selectedUser?.id
              ? senderId !== normalizeId(selectedUser.id)
              : false;
          const selectedUserId = selectedUser?.id;
          const isSeen = selectedUserId
            ? m.seenBy?.includes(selectedUserId) || false
              : false;
          const currentDate = m.createdAt || new Date();
          const isMyLastSeen = isMine && isSeen && index === lastMyMessageIndex;

          const prev = index > 0 ? messages[index - 1] : null;
          const prevDate = prev ? prev.createdAt || new Date() : null;
          const shouldShowTimeLabel =
            !prevDate ||
            new Date(currentDate).getTime() - new Date(prevDate).getTime() >=
              30 * 60 * 1000;

          return (
            <div
              key={m.id || `${senderId}-${m.createdAt}-${Math.random()}`}
              className="space-y-1"
            >
              {shouldShowTimeLabel && (
                <div className="flex justify-center">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                    {formatTimeLabel(currentDate)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
              >
                {!isMine && (
                  <div className="shrink-0">
                    <Link
                      to={ROUTES.PROFILE.url.replace(
                        ":fullName",
                        selectedUser?.fullName ||
                          selectedUser?.username ||
                          "user",
                      )}
                      className="block rounded-full hover:opacity-80 transition-opacity"
                      aria-label={`Xem trang cá nhân của ${selectedUser?.fullName || selectedUser?.username || "User"}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold">
                        {selectedUser?.avatar ? (
                          <img
                            src={selectedUser.avatar}
                            alt=""
                            className="h-8 w-8 object-cover"
                          />
                        ) : (
                          getInitials(
                            selectedUser?.fullName ||
                              selectedUser?.username ||
                              "User",
                          )
                        )}
                      </div>
                    </Link>
                  </div>
                )}
                <div
                  className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                >
                  <div className="relative inline-flex items-center group/message">
                    <div
                      className={`rounded-lg px-3 py-1.5 ${
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                      }`}
                    >
                      {m.content}
                    </div>
                    <div
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-md bg-background/95 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm border opacity-0 group-hover/message:opacity-100 max-w-[220px] whitespace-normal wrap-break-word ${
                        isMine
                          ? "right-full mr-2 text-right"
                          : "left-full ml-2 text-left"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span>{formatHoverDateTime(currentDate)}</span>
                        {isMyLastSeen && (
                          <span className="text-primary">Đã xem</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
