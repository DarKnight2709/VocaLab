import ChatView from '@/features/chat/components/ChatView'
import { Button } from '@/shared/components/ui/button'
import { PanelRightClose } from 'lucide-react'
import { useTranslation } from "@/shared/hooks/useTranslation";

import type { MeResponse } from "@/shared/validations/AuthSchema";

type RightSidebarProps = {
  me: MeResponse | undefined | null;
  embedded?: boolean;
  onClose?: () => void;
};

export default function RightSidebar({
  me,
  embedded = true,
  onClose,
}: RightSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="relative h-full min-h-0 overflow-hidden border-l bg-background overscroll-contain">
      {/* Toggle handle on the border between main and right sidebar */}
      {onClose && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onClose}
          className="absolute left-0 top-1/2 z-50 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-lg"
          aria-label={t("common.cancel")}
          title={t("common.cancel")}
        >
          <PanelRightClose className="h-5 w-5" />
        </Button>
      )}

      <div className="h-full min-h-0 overflow-hidden">
        <ChatView me={me} embedded={embedded} />
      </div>
    </aside>
  );
}
