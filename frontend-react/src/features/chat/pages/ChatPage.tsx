import { useMeQuery } from "@/features/auth/api/authService";
import ChatView from "@/features/chat/components/ChatView";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function ChatPage() {
  const { t } = useTranslation();
  const { data: me } = useMeQuery();
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <div className="px-6 pt-6">
        <Breadcrumb items={[{ label: t("chat.title") }]} className="mb-2" />
      </div>
      <ChatView me={me} embedded={false} />
    </div>
  );
}
