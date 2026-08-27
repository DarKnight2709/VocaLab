import { Flame, Trophy, Calendar, Clock } from "lucide-react";
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
    ? `${totalHours}h ${remainingMinutes}m`
    : `${totalMinutes}m`;

  return (
    <Card className="rounded-3xl bg-card border border-border/80 shadow-xs p-6 flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-orange-500 border border-orange-500/30 shadow-xs shrink-0">
          <Flame className="h-8 w-8" />
        </div>
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("stats.currentStreak") || "Current Streak"}
          </div>
          <div className="text-3xl font-extrabold text-foreground tracking-tight mt-0.5">
            {currentStreak} <span className="text-base font-medium text-muted-foreground ml-0.5">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{t("stats.maxStreak") || "Max Streak"}</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {maxStreak} <span className="text-xs font-normal text-muted-foreground">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{t("stats.totalDays") || "Total Days"}</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {totalDays} <span className="text-xs font-normal text-muted-foreground">{t("stats.daysCount") || "days"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
            <Clock className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span className="truncate">{t("stats.totalTime") || "Total Time"}</span>
          </div>
          <div className="text-lg font-bold text-foreground truncate">
            {timeString}
          </div>
        </div>
      </div>
    </Card>
  );
};
