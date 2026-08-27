import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StudySummaryProps {
  todayMinutes: number;
}

export const StudySummary = ({ todayMinutes }: StudySummaryProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("stats.today")}
          </span>
          <div className="text-2xl font-bold text-foreground">
            {todayMinutes} <span className="text-sm font-normal text-muted-foreground">{t("stats.min")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
