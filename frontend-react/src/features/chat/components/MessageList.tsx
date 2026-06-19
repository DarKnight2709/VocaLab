import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import ROUTES from "@/shared/lib/routes";
import { getInitials } from "../utils";
import type { UserItem, ChatMessageItem } from "@/shared/validations/ChatSchema";
import type { GroupItem, GroupMessageItem } from "@/shared/validations/GroupSchema";
import i18n from "@/shared/i18n";
import { useTranslation } from "@/shared/hooks/useTranslation";

type MessageListProps = {
  selectedGroup: GroupItem | null;
  messages: ChatMessageItem[];
  groupMessages: GroupMessageItem[];
  loadingMessages: boolean;
  loadingGroupMessages: boolean;
  selectedUser: UserItem | null;
  myId: string;
};

type AttachmentItem = {
  _uploading?: boolean;
  type?: string;
  url?: string;
  name?: string;
};

function normalizeId(id: unknown): string {
  if (!id) return "";
  if (typeof id === "object" && id !== null && "id" in id) {
    return String((id as { id: unknown }).id);
  }
  return String(id);
}

function formatTimeLabel(date: string | Date) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsedDate.getTime())) return "";

  const now = new Date();
  const isToday =
    parsedDate.getFullYear() === now.getFullYear() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getDate() === now.getDate();

  const time = parsedDate.toLocaleTimeString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) return time;

  const dateLabel = parsedDate.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${dateLabel} ${time}`;
}

function formatHoverDateTime(date: string | Date) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function MessageBubble({
  content,
  attachments,
  isMine,
  currentDate,
  isSeen,
  isLastMineMessage,
  onOpenImage,
}: {
  content: string;
  attachments?: AttachmentItem[];
  isMine: boolean;
  currentDate: string | Date;
  isSeen: boolean;
  isLastMineMessage: boolean;
  onOpenImage: (url: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative inline-flex items-center group/message">
      <div
        className={`rounded-lg px-3 py-1.5 ${isMine ? "bg-primary text-primary-foreground" : "bg-card border"}`}
      >
        {content}
        {attachments?.map((attachment, index) => (
          <div key={index} className="mt-1">
            {attachment._uploading ? (
              <div className="flex items-center gap-2 text-xs opacity-70">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>{t("chat.uploading", { name: attachment.name })}</span>
              </div>
            ) : attachment.type === "image" ? (
              <img
                src={attachment.url}
                onClick={() => attachment.url && onOpenImage(attachment.url)}
                className="max-w-50 cursor-pointer rounded-lg transition-opacity hover:opacity-90"
                alt=""
              />
            ) : attachment.type === "video" ? (
              <video src={attachment.url} controls className="max-w-50 rounded-lg" />
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs underline"
              >
                {attachment.name || t("common.download")}
              </a>
            )}
          </div>
        ))}
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 rounded-md bg-background/95 px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm border opacity-0 group-hover/message:opacity-100 max-w-55 whitespace-normal wrap-break-word transition-opacity z-10 pointer-events-auto ${isMine ? "right-full mr-2 text-right" : "left-full ml-2 text-left"}`}
      >
        <div className="flex flex-col gap-0.5">
          <span>{formatHoverDateTime(currentDate)}</span>
          {isMine && isSeen && isLastMineMessage && (
            <span className="font-medium text-primary">{t("chat.seen")}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageList({
  selectedGroup,
  messages,
  groupMessages,
  loadingMessages,
  loadingGroupMessages,
  selectedUser,
  myId,
}: MessageListProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const lastMyMessageIndex = useMemo(() => {
    const myIdNorm = normalizeId(myId);
    let lastIndex = -1;

    messages.forEach((message, index) => {
      if (normalizeId(message.senderId) === myIdNorm) {
        lastIndex = index;
      }
    });

    return lastIndex;
  }, [messages, myId]);

  // Scroll to bottom when message count changes (with smooth scrolling)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, groupMessages.length]);

  // Scroll to bottom instantly when switching chats
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [selectedUser?.id, selectedGroup?.id]);

  const renderMessageGroup = (
    message: ChatMessageItem | GroupMessageItem,
    index: number,
    allMessages: Array<ChatMessageItem | GroupMessageItem>,
    isGroupChat: boolean,
  ) => {
    const senderId = normalizeId(message.senderId);
    const previousMessage = index > 0 ? allMessages[index - 1] : null;
    const previousDate = previousMessage ? previousMessage.createdAt || new Date() : null;
    const currentDate = message.createdAt || new Date();
    const shouldShowTimeLabel =
      !previousDate ||
      new Date(currentDate).getTime() - new Date(previousDate).getTime() >= 30 * 60 * 1000;
    const isFirstInSequence =
      !previousMessage ||
      normalizeId(previousMessage.senderId) !== senderId ||
      shouldShowTimeLabel;

    const sender =
      (message as any).sender ||
      (typeof message.senderId === "object" ? message.senderId : null);
    const senderName = sender?.fullName || sender?.username || "User";
    const senderAvatar = sender?.avatar;
    const isMine = isGroupChat
      ? normalizeId(message.senderId) === normalizeId(myId)
      : normalizeId(message.senderId) === normalizeId(myId)
        ? true
        : selectedUser?.id
          ? normalizeId(message.senderId) !== normalizeId(selectedUser.id)
          : false;
    const isSeen = !isGroupChat
      ? (selectedUser?.id
          ? (message.seenBy || []).some(
              (viewer: any) =>
                (typeof viewer === "string" ? viewer : viewer?.id) === selectedUser.id,
            )
          : false)
      : false;
    const attachments = (message as any).attachments as AttachmentItem[] | undefined;

    return (
      <div
        key={message.id || `${senderId}-${message.createdAt}-${index}`}
        className={isFirstInSequence ? "mt-4" : "mt-0.5"}
      >
        {shouldShowTimeLabel && (
          <div className="flex justify-center mb-3">
            <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
              {formatTimeLabel(currentDate)}
            </span>
          </div>
        )}

        <div className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}>
          {!isMine && (
            <div className="shrink-0 w-8">
              {isFirstInSequence ? (
                <Link
                  to={ROUTES.PROFILE.url.replace(
                    ":username",
                    isGroupChat ? sender?.username || "user" : selectedUser?.username || "user",
                  )}
                  className="group/avatar relative block rounded-full"
                  aria-label={`Open ${isGroupChat ? senderName : selectedUser?.fullName || selectedUser?.username || "user"} profile`}
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold transition-opacity hover:opacity-80">
                    {senderAvatar || selectedUser?.avatar ? (
                      <img
                        src={isGroupChat ? senderAvatar : selectedUser?.avatar}
                        alt=""
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      getInitials(isGroupChat ? senderName : selectedUser?.fullName || selectedUser?.username || "User")
                    )}
                  </div>
                  <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 invisible shadow-lg transition-all group-hover/avatar:visible group-hover/avatar:opacity-100">
                    {isGroupChat ? senderName : selectedUser?.fullName || selectedUser?.username || "User"}
                  </div>
                </Link>
              ) : (
                <div className="w-8" />
              )}
            </div>
          )}

          <div className={`flex max-w-[70%] flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
            {!isMine && isFirstInSequence && (
              <span className="mb-0.5 ml-1 select-none text-[10px] font-semibold tracking-wide text-primary/80">
                {isGroupChat ? senderName : selectedUser?.fullName || selectedUser?.username || "User"}
              </span>
            )}

            <MessageBubble
              content={message.content ?? ""}
              attachments={attachments}
              isMine={isMine}
              currentDate={currentDate}
              isSeen={isSeen}
              isLastMineMessage={index === lastMyMessageIndex}
              onOpenImage={setLightboxUrl}
            />
          </div>
        </div>
      </div>
    );
  };

  const activeMessages = selectedGroup ? groupMessages : messages;

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-auto overscroll-contain bg-muted/30 p-4 flex flex-col"
    >
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLightboxUrl(null)}
          onKeyDown={(event) => event.key === "Escape" && setLightboxUrl(null)}
          tabIndex={-1}
        >
          <img
            src={lightboxUrl}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            alt=""
          />
        </div>
      )}

      {selectedGroup ? (
        loadingGroupMessages ? (
          <div className="text-center text-muted-foreground">{t("chat.loading")}</div>
        ) : groupMessages.length === 0 ? (
          <div className="text-center text-muted-foreground">{t("chat.noMessages")}</div>
        ) : (
          groupMessages.map((message, index) => renderMessageGroup(message, index, activeMessages, true))
        )
      ) : loadingMessages ? (
        <div className="text-center text-muted-foreground">{t("chat.loading")}</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-muted-foreground">{t("chat.noMessages")}</div>
      ) : (
        messages.map((message, index) => renderMessageGroup(message, index, activeMessages, false))
      )}
    </div>
  );
}
