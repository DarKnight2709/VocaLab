import React from "react";
import { Outlet } from "react-router-dom";
import { Clock } from "lucide-react";
import { useStudyTimer } from "../hooks/useStudyTimer";
import { useLayoutStore } from "../stores/useLayoutStore";

export const StudyLayout: React.FC = () => {
  const { isIdle } = useStudyTimer();
  const { isFocusMode } = useLayoutStore();

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8 relative">
      {!isFocusMode && (
        <div className="absolute right-6 top-4 md:right-8 md:top-6 z-50">
          <Clock
            className={`w-5 h-5 transition-colors duration-200 ${
              isIdle ? "text-red-500" : "text-emerald-500"
            }`}
          />
        </div>
      )}

      <div className={`w-full mx-auto ${isFocusMode ? "max-w-none px-4 md:px-12" : "max-w-[1600px]"}`}>
        <Outlet />
      </div>
    </div>
  );
};
