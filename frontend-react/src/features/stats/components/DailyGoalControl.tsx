import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Target, ArrowUpRight } from "lucide-react";
import ROUTES from "@/shared/lib/routes";

interface DailyGoalControlProps {
  dailyGoalMinutes: number;
}

export const DailyGoalControl = ({ dailyGoalMinutes }: DailyGoalControlProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60">
      <div className="flex items-center gap-2.5">
        <Target className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("stats.dailyGoal")}:
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-foreground text-base">
          {dailyGoalMinutes} <span className="text-xs font-normal text-muted-foreground">{t("stats.min")}</span>
        </span>
        <Button
          onClick={() => navigate(ROUTES.ME_SETTING_LEARNING.url)}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          title={t("stats.changeDailyGoal")}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
