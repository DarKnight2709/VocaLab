import { MessageInput } from "@/features/chat/components/MessageInput";
import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { MessageList } from "@/features/chat/components/MessageList";
import type {
  UserItem,
  ChatMessageItem,
} from "@/shared/validations/ChatSchema";
import type {
  GroupItem,
  GroupMessageItem,
} from "@/shared/validations/GroupSchema";
import { useTranslation } from "@/shared/hooks/useTranslation";

type ChatAreaProps = {
  embedded?: boolean;
  hideHeader?: boolean;
  selectedUser: UserItem | null;
  selectedGroup: GroupItem | null;
  isSelectedUserOnline: boolean;
  groupTypingText: string;
  typingUsersCount: number;

  messages: ChatMessageItem[];
  groupMessages: GroupMessageItem[];
  loadingMessages: boolean;
  loadingGroupMessages: boolean;
  myId: string;

  messageText: string;
  onMessageTextChange: (value: string) => void;
  onTyping: () => void;
  onSend: (files: File[], gifs?: { url: string; name: string }[]) => void;
  onEmojiClick: (emoji: string) => void;
  onBackToList: () => void;
  onOpenGroupInfo: () => void;
  onCallClick?: () => void;
};

export function ChatArea({
  embedded = false,
  hideHeader = false,
  selectedUser,
  selectedGroup,
  isSelectedUserOnline,
  groupTypingText,
  typingUsersCount,
  messages,
  groupMessages,
  loadingMessages,
  loadingGroupMessages,
  myId,
  messageText,
  onMessageTextChange,
  onTyping,
  onEmojiClick,
  onSend,
  onBackToList,
  onOpenGroupInfo,
  onCallClick,
}: ChatAreaProps) {
  const { t } = useTranslation();
  const canChatWithUser = selectedUser ? selectedUser.canChat !== false : true;
  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {!hideHeader && (
        <ChatHeader
          embedded={embedded}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          isSelectedUserOnline={isSelectedUserOnline}
          onBack={onBackToList}
          onGroupInfoClick={onOpenGroupInfo}
          onCallClick={onCallClick}
        />
      )}

      <MessageList
        selectedGroup={selectedGroup}
        messages={messages}
        groupMessages={groupMessages}
        loadingMessages={loadingMessages}
        loadingGroupMessages={loadingGroupMessages}
        selectedUser={selectedUser}
        myId={myId}
      />

      {/* Typing Indicator - fixed above input, doesn't affect layout */}
      {((!selectedGroup && typingUsersCount > 0) ||
        (selectedGroup && !!groupTypingText)) && (
        <div className="absolute bottom-17 left-0 right-0 px-4 pointer-events-none">
          <span className="text-xs text-muted-foreground">
            {!selectedGroup && typingUsersCount > 0
              ? t("chat.typing")
              : groupTypingText}
          </span>
        </div>
      )}

      {canChatWithUser ? (
        <MessageInput
          messageText={messageText}
          onMessageTextChange={onMessageTextChange}
          onTyping={onTyping}
          onEmojiClick={onEmojiClick}
          onSend={onSend}
        />
      ) : (
        <div className="p-4 bg-destructive/10 border-t border-destructive/20 flex items-center justify-center gap-2 text-destructive text-sm font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 animate-pulse"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t("chat.cannotMessagePrivacy")}
        </div>
      )}
    </div>
  );
}
