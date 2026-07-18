import { useState, useEffect } from "react";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import PublicHeader from "@/shared/components/main-components/PublicHeader";
import PublicSidebar from "@/shared/components/main-components/PublicSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { useFcmToken } from "@/features/notification/hooks/usePushNotifications";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

function AuthenticatedLayoutWrapper({ children }: { children: React.ReactNode }) {
  useFcmToken();
  return <>{children}</>;
}

export default function PublicLayout() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const { isLeftSidebarVisible, setIsLeftSidebarVisible, toggleLeftSidebar } = useLayoutStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsLeftSidebarVisible(true);
      } else {
        setIsLeftSidebarVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isAuth = useAuthStore((s) => s.isAuth);
  const { isLoading, isPending, data: me } = useMeQuery();

  if (isAuth && (isLoading || isPending)) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center">
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
            toggleLeftSidebar={toggleLeftSidebar}
          />

          <div className="flex-1 min-h-0 flex overflow-hidden relative">
            {/* Mobile Backdrop Overlay */}
            {isLeftSidebarVisible && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsLeftSidebarVisible(false)}
              />
            )}
            <div
              className={`absolute md:relative z-50 h-full bg-card transition-all duration-300 ease-in-out overflow-hidden ${
                isLeftSidebarVisible 
                  ? "w-64 min-w-[256px] translate-x-0" 
                  : "w-64 -translate-x-full md:translate-x-0 md:w-16 md:min-w-[64px]"
              }`}
            >
              <LeftSidebar isMinimized={!isMobile && !isLeftSidebarVisible} />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden relative bg-muted/30">
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
        toggleLeftSidebar={toggleLeftSidebar}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isLeftSidebarVisible ? "w-64 min-w-[256px]" : "w-0"
          }`}
        >
          <PublicSidebar />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden relative bg-muted/30">
          <MainOutlet />
        </div>
      </div>
    </div>
  );
}
