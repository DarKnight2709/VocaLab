import React from "react";
import { Outlet } from "react-router-dom";
import { Clock } from "lucide-react";
import { useStudyTimer } from "../hooks/useStudyTimer";

export const StudyLayout: React.FC = () => {
  const { isIdle } = useStudyTimer();

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 relative">
      <div className="absolute right-4 top-4 md:right-6 md:top-6 z-50">
        <Clock
          className={`w-5 h-5 transition-colors duration-200 ${
            isIdle ? "text-red-500" : "text-emerald-500"
          }`}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};