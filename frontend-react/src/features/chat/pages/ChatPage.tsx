import { useMeQuery } from "@/features/auth/api/authService";
import ChatView from "@/features/chat/components/ChatView";
import Breadcrumb from "@/shared/components/Breadcrumb";

export default function ChatPage() {
  const { data: me } = useMeQuery();
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <div className="px-6 pt-6">
        <Breadcrumb items={[{ label: "Chat" }]} className="mb-2" />
      </div>
      <ChatView me={me} embedded={false} />
    </div>
  );
}
