import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import { useFcmToken } from "@/features/notification/hooks/usePushNotifications";
import { useState, useEffect } from "react";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";

export default function MainLayout() {
  const { isLoading, isPending, data: me } = useMeQuery();
  // Initialize FCM globally so foreground messages are received on all pages
  useFcmToken();
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

  if (isLoading || isPending) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center">
        <LoadingSpinner isLoading />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background relative">
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
        
        {/* Sidebar Container */}
        <div
          className={`absolute md:relative z-50 h-full bg-card transition-all duration-300 ease-in-out overflow-hidden ${
            isLeftSidebarVisible 
              ? "w-64 min-w-[256px] translate-x-0" 
              : "w-64 -translate-x-full md:translate-x-0 md:w-16 md:min-w-[64px]"
          }`}
        >
          <LeftSidebar isMinimized={!isMobile && !isLeftSidebarVisible} />
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden w-full bg-muted/30">
          <MainOutlet />
        </div>
      </div>
    </div>
  );
}
