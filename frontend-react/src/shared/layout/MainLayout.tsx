import { useMeQuery } from "@/features/auth/api/authService";
import LoadingSpinner from "@/shared/components/LoadingSpinner";

import LeftSidebar from "@/shared/components/main-components/LeftSidebar";
import MainHeader from "@/shared/components/main-components/MainHeader";
import MainOutlet from "@/shared/components/main-components/MainOutlet";
import RightSidebar from "@/shared/components/main-components/RightSidebar";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const MIN_RIGHT_WIDTH = 300;
const MAX_RIGHT_WIDTH = 800;
const DEFAULT_RIGHT_WIDTH = 560;

export default function MainLayout() {
  const { isLoading, isPending, data: me } = useMeQuery();
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [isLeftSidebarVisible, setIsLeftSidebarVisible] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(DEFAULT_RIGHT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= MIN_RIGHT_WIDTH && newWidth <= MAX_RIGHT_WIDTH) {
          setRightSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (isLoading || isPending) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-dvw items-center justify-center bg-[url(/debut-light.png)] bg-fixed">
        <LoadingSpinner isLoading />
      </div>
    );
  }

  const gridCols = [
    isLeftSidebarVisible ? "280px" : "0px",
    "1fr",
    isRightSidebarVisible ? `${rightSidebarWidth}px` : "0px",
  ].join(" ");

  return (
    <div className={`h-dvh overflow-hidden flex flex-col bg-background ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      <MainHeader
        me={me}
        toggleLeftSidebar={() => setIsLeftSidebarVisible(!isLeftSidebarVisible)}
      />

      <div className="flex-1 min-h-0">
        <div
          className={`h-full min-h-0 grid ${!isResizing ? 'transition-[grid-template-columns] duration-300 ease-in-out' : ''}`}
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className={`min-h-0 overflow-hidden ${isLeftSidebarVisible ? "border-r" : ""}`}>
            <LeftSidebar />
          </div>
          <MainOutlet />
          
          <div className="relative flex min-h-0">
            {isRightSidebarVisible && (
              <>
                <div
                  onMouseDown={startResizing}
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10"
                />
                <div className="flex-1 min-h-0 overflow-hidden border-l">
                  <RightSidebar onClose={() => setIsRightSidebarVisible(false)} />
                </div>
              </>
            )}
          </div>
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
