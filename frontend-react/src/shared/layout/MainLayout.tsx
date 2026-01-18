import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";

import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import RightSidebar from "@/shared/components/main-components/RightSidebar";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function MainLayout() {
  const { isLoading, isPending, data } = useMeQuery();
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);

  if (isLoading || isPending) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[url(/debut-light.png)] bg-fixed">
        <LoadingSpinner isLoading />
      </div>
    );
  }
  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background">
      <MainHeader me={data?.user} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className={
            "h-full min-h-0 grid " +
            (isRightSidebarVisible
              ? "grid-cols-[280px_1fr_560px]"
              : "grid-cols-[280px_1fr]")
          }
        >
          <LeftSidebar />
          <MainOutlet />
          {isRightSidebarVisible && (
            <RightSidebar onClose={() => setIsRightSidebarVisible(false)} />
          )}
        </div>
      </div>

      {!isRightSidebarVisible && (
        <Button
          type="button"
          onClick={() => setIsRightSidebarVisible(true)}
          className="fixed right-4 top-24 z-50 h-12 w-12 rounded-full shadow-lg"
          aria-label="Hiện thanh bên phải"
          title="Hiện thanh bên phải"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
