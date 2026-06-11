import { useTranslation } from "react-i18next";

interface StudySummaryProps {
  todayMinutes: number;
}

export const StudySummary = ({ todayMinutes }: StudySummaryProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="text-[#64748b] text-xl">
        {t("stats.today")}: <span className="font-bold text-foreground text-2xl ml-1">{todayMinutes} {t("stats.min")}</span>
      </div>
    </div>
  );
};
