import React from "react";
import { Outlet } from "react-router-dom";
import { Clock } from "lucide-react";
import { useStudyTimer } from "../hooks/useStudyTimer";

export const StudyLayout: React.FC = () => {
  const { isIdle } = useStudyTimer();

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8 relative">
      <div className="absolute right-6 top-4 md:right-8 md:top-6 z-50">
        <Clock
          className={`w-5 h-5 transition-colors duration-200 ${
            isIdle ? "text-red-500" : "text-emerald-500"
          }`}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto">
        <Outlet />
      </div>
    </div>
  );
};
