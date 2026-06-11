import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ROUTES from "@/shared/lib/routes";

interface DailyGoalControlProps {
  dailyGoalMinutes: number;
}

export const DailyGoalControl = ({ dailyGoalMinutes }: DailyGoalControlProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      <div className="text-[#475569] text-lg mb-4">
        {t("stats.dailyGoal")}: <span className="font-bold text-foreground">{dailyGoalMinutes} {t("stats.min")}</span>
      </div>
      
      <Button 
        onClick={() => navigate(ROUTES.ME_SETTING_LEARNING.url)}
        className="w-full rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-6 text-lg tracking-wide hover:opacity-90 transition-all font-sans shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)]"
      >
        {t("stats.changeDailyGoal")}
      </Button>
    </div>
  );
};
