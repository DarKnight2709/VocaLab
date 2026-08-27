import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";

interface WeeklyAverageProps {
  weeklyAverageMinutes: number;
}

export const WeeklyAverage = ({ weeklyAverageMinutes }: WeeklyAverageProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60">
      <div className="flex items-center gap-2.5">
        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("stats.weeklyAverage")}:
        </span>
      </div>
      <span className="font-bold text-foreground text-base">
        {weeklyAverageMinutes} <span className="text-xs font-normal text-muted-foreground">{t("stats.min")}</span>
      </span>
    </div>
  );
};
