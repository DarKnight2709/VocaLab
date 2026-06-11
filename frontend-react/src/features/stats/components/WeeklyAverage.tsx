import { useTranslation } from "react-i18next";

interface WeeklyAverageProps {
  weeklyAverageMinutes: number;
}

export const WeeklyAverage = ({ weeklyAverageMinutes }: WeeklyAverageProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4 pb-2">
      <div className="text-[#64748b] text-base mb-1">
        {t("stats.weeklyAverage")}:
      </div>
      <div className="font-bold text-foreground text-xl">
        {weeklyAverageMinutes} {t("stats.min")}
      </div>
    </div>
  );
};
