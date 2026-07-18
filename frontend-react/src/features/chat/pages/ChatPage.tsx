import { useMeQuery } from "@/features/auth/api/authService";
import ChatView from "@/features/chat/components/ChatView";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function ChatPage() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  return (
    <div className="h-full overflow-hidden px-4 py-4 md:px-8 md:py-6 flex flex-col">
      <div className="w-full max-w-[1600px] mx-auto h-full flex flex-col min-h-0">
        <div className="shrink-0 mb-2">
          <Breadcrumb items={[{ label: t("chat.title") }]} />
        </div>
        <div className="flex-1 min-h-0">
          <ChatView me={me} embedded={false} />
        </div>
      </div>
    </div>
  );
}
