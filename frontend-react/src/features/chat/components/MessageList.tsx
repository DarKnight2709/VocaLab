import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { getInitials } from "../utils";
import type {
  UserItem,
  ChatMessageItem,
} from "@/shared/validations/ChatSchema";
import type {
  GroupItem,
  GroupMessageItem,
} from "@/shared/validations/GroupSchema";

type MessageListProps = {
  selectedGroup: GroupItem | null;
  messages: ChatMessageItem[];
  groupMessages: GroupMessageItem[];
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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

  // Scroll to bottom when messages change or when switching chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, groupMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [selectedUser?.id, selectedGroup?.id]);

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
    <div className="flex-1 overflow-auto overscroll-contain p-4 bg-muted/30 min-h-0 flex flex-col">
      {/* Image lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          tabIndex={-1}
        >
          <img
            src={lightboxUrl}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
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
            // ✅ Use sender object if available, fallback to senderId object
            const sender =
              (m as any).sender ||
              (typeof m.senderId === "object" ? m.senderId : null);
            const senderName =
              sender?.fullName || sender?.username || "Người dùng";
            const senderAvatar = sender?.avatar;
            const isMine = senderId === normalizeId(myId);
            const currentDate = m.createdAt || new Date();

            const prev = index > 0 ? groupMessages[index - 1] : null;
            const prevDate = prev ? prev.createdAt || new Date() : null;
            const shouldShowTimeLabel =
              !prevDate ||
              new Date(currentDate).getTime() - new Date(prevDate).getTime() >=
                30 * 60 * 1000;

            const isFirstInSequence =
              !prev ||
              normalizeId(prev.senderId) !== senderId ||
              shouldShowTimeLabel;

            return (
              <div
                key={m.id || `${senderId}-${m.createdAt}-${Math.random()}`}
                className={isFirstInSequence ? "mt-4" : "mt-0.5"}
              >
                {shouldShowTimeLabel && (
                  <div className="flex justify-center mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                      {formatTimeLabel(currentDate)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
                >
                  {!isMine && (
                    <div className="shrink-0 w-8">
                      {isFirstInSequence ? (
                        <Link
                          to={ROUTES.PROFILE.url.replace(
                            ":username",
                            sender?.username || "user",
                          )}
                          className="block rounded-full group/avatar relative"
                          aria-label={`Xem trang cá nhân của ${senderName}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold hover:opacity-80 transition-opacity">
                            {senderAvatar ? (
                              <img
                                src={senderAvatar}
                                alt=""
                                className="h-8 w-8 object-cover"
                              />
                            ) : (
                              getInitials(senderName)
                            )}
                          </div>
                          {/* Tooltip tên */}
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all whitespace-nowrap z-50">
                            {senderName}
                          </div>
                        </Link>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
                  >
                    {!isMine && isFirstInSequence && (
                      <span className="text-[10px] font-semibold text-primary/80 tracking-wide mb-0.5 ml-1 select-none">
                        {senderName}
                      </span>
                    )}
                    <div className="relative inline-flex items-center group/message">
                      <div
                        className={`rounded-lg px-3 py-1.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border"
                        }`}
                      >
                        {m.content}
                        {(m as any).attachments?.map((att: any, i: number) => (
                          <div key={i} className="mt-1">
                            {att._uploading ? (
                              <div className="flex items-center gap-2 text-xs opacity-70">
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Đang tải {att.name}...</span>
                              </div>
                            ) : att.type === "image" ? (
                              <img
                                src={att.url}
                                onClick={() => setLightboxUrl(att.url)}
                                className="max-w-50 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            ) : att.type === "video" ? (
                              <video
                                src={att.url}
                                controls
                                className="max-w-50 rounded-lg"
                              />
                            ) : (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs underline"
                              >
                                {att.name || "Tải về"}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 rounded-md bg-background/95 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm border opacity-0 group-hover/message:opacity-100 max-w-55 whitespace-normal wrap-break-word transition-opacity z-10 pointer-events-auto ${
                          isMine
                            ? "right-full mr-2 text-right"
                            : "left-full ml-2 text-left"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{formatHoverDateTime(currentDate)}</span>
                          {isMine && m.seenBy && m.seenBy.length > 0 && (
                            <div className="relative group/seen">
                              <div className="text-primary font-medium hover:underline cursor-pointer transition-all">
                                Đã xem ({m.seenBy.length})
                              </div>

                              <div
                                className={`absolute bottom-full mb-2 ${isMine ? "right-0" : "left-0"} bg-card border rounded-xl shadow-xl p-3 z-50 min-w-50 opacity-0 invisible group-hover/seen:opacity-100 group-hover/seen:visible transition-all duration-200 pointer-events-auto`}
                              >
                                <div className="flex justify-between items-center mb-2 px-1">
                                  <span className="text-xs font-bold text-foreground">
                                    Đã xem bởi
                                  </span>
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                    {m.seenBy.length}
                                  </span>
                                </div>
                                <div className="max-h-37.5 overflow-y-auto custom-scrollbar pr-1">
                                  <ul className="space-y-1.5 text-left">
                                    {(m.seenBy || []).map(
                                      (user: any, idx: number) => {
                                        const name =
                                          typeof user === "string"
                                            ? "Người dùng"
                                            : user.fullName ||
                                              user.username ||
                                              "Người dùng";
                                        const avatar =
                                          typeof user === "object"
                                            ? user.avatar
                                            : null;
                                        return (
                                          <li key={idx}>
                                            <Link
                                              to={ROUTES.PROFILE.url.replace(
                                                ":username",
                                                user.username,
                                              )}
                                              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-colors pointer-events-auto"
                                            >
                                              <div className="h-6 w-6 rounded-full bg-muted overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {avatar ? (
                                                  <img
                                                    src={avatar}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                  />
                                                ) : (
                                                  getInitials(name)
                                                )}
                                              </div>
                                              <span className="text-xs font-medium truncate text-foreground/90">
                                                {name}
                                              </span>
                                            </Link>
                                          </li>
                                        );
                                      },
                                    )}
                                  </ul>
                                </div>
                              </div>
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
          const isMine = myId
            ? senderId === normalizeId(myId)
            : selectedUser?.id
              ? senderId !== normalizeId(selectedUser.id)
              : false;
          const selectedUserId = selectedUser?.id;
          const isSeen = selectedUserId
            ? m.seenBy?.some(
                (u) =>
                  (typeof u === "string" ? u : (u as any).id) ===
                  selectedUserId,
              ) || false
            : false;
          const currentDate = m.createdAt || new Date();

          const prev = index > 0 ? messages[index - 1] : null;
          const prevDate = prev ? prev.createdAt || new Date() : null;
          const shouldShowTimeLabel =
            !prevDate ||
            new Date(currentDate).getTime() - new Date(prevDate).getTime() >=
              30 * 60 * 1000;

          const isFirstInSequence =
            !prev ||
            normalizeId(prev.senderId) !== senderId ||
            shouldShowTimeLabel;

          return (
            <div
              key={m.id || `${senderId}-${m.createdAt}-${Math.random()}`}
              className={isFirstInSequence ? "mt-4" : "mt-0.5"}
            >
              {shouldShowTimeLabel && (
                <div className="flex justify-center mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                    {formatTimeLabel(currentDate)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}
              >
                {!isMine && (
                  <div className="shrink-0 w-8">
                    {isFirstInSequence ? (
                      <Link
                        to={ROUTES.PROFILE.url.replace(
                          ":username",
                          selectedUser?.username || "user",
                        )}
                        className="block rounded-full group/avatar relative"
                        aria-label={`Xem trang cá nhân của ${selectedUser?.fullName || selectedUser?.username || "User"}`}
                      >
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xs font-semibold hover:opacity-80 transition-opacity">
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
                        {/* Tooltip tên */}
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible group-hover/avatar:opacity-100 group-hover/avatar:visible transition-all whitespace-nowrap z-50">
                          {selectedUser?.fullName ||
                            selectedUser?.username ||
                            "Người dùng"}
                        </div>
                      </Link>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}
                <div
                  className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}
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
                      {(m as any).attachments?.map((att: any, i: number) => (
                        <div key={i} className="mt-1">
                          {att._uploading ? (
                            <div className="flex items-center gap-2 text-xs opacity-70">
                              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              <span>Đang tải {att.name}...</span>
                            </div>
                          ) : att.type === "image" ? (
                            <img
                              src={att.url}
                              onClick={() => setLightboxUrl(att.url)}
                              className="max-w-50 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          ) : att.type === "video" ? (
                            <video
                              src={att.url}
                              controls
                              className="max-w-50 rounded-lg"
                            />
                          ) : (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs underline"
                            >
                              {att.name || "Tải về"}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 rounded-md bg-background/95 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm border opacity-0 group-hover/message:opacity-100 max-w-55 whitespace-normal wrap-break-word transition-opacity z-10 pointer-events-auto ${
                        isMine
                          ? "right-full mr-2 text-right"
                          : "left-full ml-2 text-left"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span>{formatHoverDateTime(currentDate)}</span>
                        {isMine && isSeen && index === lastMyMessageIndex && (
                          <span className="text-primary font-medium">
                            Đã xem
                          </span>
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
