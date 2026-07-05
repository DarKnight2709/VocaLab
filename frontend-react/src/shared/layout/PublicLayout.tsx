import { useState } from "react";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import PublicHeader from "@/shared/components/main-components/PublicHeader";
import PublicSidebar from "@/shared/components/main-components/PublicSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { useFcmToken } from "@/features/notification/hooks/usePushNotifications";

function AuthenticatedLayoutWrapper({ children }: { children: React.ReactNode }) {
  useFcmToken();
  return <>{children}</>;
}

export default function PublicLayout() {
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const isAuth = useAuthStore((s) => s.isAuth);
  const { isLoading, isPending, data: me } = useMeQuery();

  if (isAuth && (isLoading || isPending)) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[url(/debut-light.png)] bg-fixed">
        <LoadingSpinner isLoading />
      </div>
    );
  }

  if (isAuth) {
    return (
      <AuthenticatedLayoutWrapper>
        <div className="h-dvh overflow-hidden flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
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
            <div className="flex-1 min-h-0 overflow-hidden relative bg-muted/20">
              <MainOutlet />
            </div>
          </div>
        </div>
      </AuthenticatedLayoutWrapper>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <PublicHeader
        toggleLeftSidebar={() => setIsLeftSidebarVisible(!isLeftSidebarVisible)}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isLeftSidebarVisible ? "w-64 min-w-[256px]" : "w-0"
          }`}
        >
          <PublicSidebar />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden relative bg-muted/20">
          <MainOutlet />
        </div>
      </div>
    </div>
  );
}
