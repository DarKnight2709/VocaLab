import { Flame, Trophy } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface StreakCardProps {
  currentStreak: number;
  maxStreak: number;
  totalDays: number;
  totalMinutes: number;
}

export const StreakCard = ({
  currentStreak,
  maxStreak,
  totalDays,
  totalMinutes,
}: StreakCardProps) => {
  const { t } = useTranslation();

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const timeString = totalHours > 0 
    ? `${totalHours} ${t("stats.hours") || "hrs"} ${remainingMinutes} ${t("stats.minutes") || "min"}`
    : `${totalMinutes} ${t("stats.minutes") || "min"}`;

  return (
    <Card className="rounded-[32px] border bg-card p-6 shadow-sm flex flex-col gap-6 w-full h-full justify-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-orange-500/10 text-orange-500">
          <Flame className="h-8 w-8" />
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("stats.currentStreak") || "Current Streak"}
          </div>
          <div className="text-3xl font-bold">
            {currentStreak} <span className="text-base font-normal text-muted-foreground ml-1">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Trophy className="h-3.5 w-3.5" />
            {t("stats.maxStreak") || "Max Streak"}
          </div>
          <div className="text-xl font-bold">
            {maxStreak} <span className="text-sm font-normal text-muted-foreground ml-1">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("stats.totalDays") || "Total Days"}
          </div>
          <div className="text-xl font-bold">
            {totalDays} <span className="text-sm font-normal text-muted-foreground ml-1">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("stats.totalTime") || "Total Time"}
          </div>
          <div className="text-xl font-bold">
            {timeString}
          </div>
        </div>
      </div>
    </Card>
  );
};
