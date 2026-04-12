import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import { useState } from "react";

export default function MainLayout() {
  const { isLoading, isPending, data: me } = useMeQuery();
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);

  if (isLoading || isPending) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[url(/debut-light.png)] bg-fixed">
        <LoadingSpinner isLoading />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background">
      <MainHeader
        me={me}
        toggleLeftSidebar={() => setIsLeftSidebarVisible(!isLeftSidebarVisible)}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden border-r ${
            isLeftSidebarVisible ? "w-64 min-w-[256px]" : "w-0"
          }`}
        >
          <LeftSidebar />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <MainOutlet />
        </div>
      </div>
    </div>
  );
}
