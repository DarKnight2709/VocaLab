import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import { useFcmToken } from "@/features/notification/hooks/usePushNotifications";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const { isLoading, isPending, data: me } = useMeQuery();
  // Initialize FCM globally so foreground messages are received on all pages
  useFcmToken();
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
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
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[url(/debut-light.png)] bg-fixed">
        <LoadingSpinner isLoading />
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col bg-background relative">
      <MainHeader
        me={me}
        toggleLeftSidebar={() => setIsLeftSidebarVisible(!isLeftSidebarVisible)}
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
          className={`absolute md:relative z-50 h-full bg-card transition-all duration-300 ease-in-out overflow-hidden border-r ${
            isLeftSidebarVisible 
              ? "w-64 min-w-[256px] translate-x-0" 
              : "w-64 -translate-x-full md:translate-x-0 md:w-0 md:min-w-0"
          }`}
        >
          <LeftSidebar />
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden w-full">
          <MainOutlet />
        </div>
      </div>
    </div>
  );
}
