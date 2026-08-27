import { Link } from "react-router";
import { ArrowRight, Clock, Target, TrendingUp } from "lucide-react";
import { useStatsQuery } from "@/features/stats/api/statsService";
import ROUTES from "@/shared/lib/routes";
import { useTranslation } from "@/shared/hooks/useTranslation";
import HomeSkeletonBox from "./HomeSkeletonBox";

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function StudyProgressCard() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useStatsQuery(0);

  if (isLoading) {
    return <HomeSkeletonBox className="h-52" />;
  }

  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoal = stats?.dailyGoalMinutes ?? 10;
  const weeklyAvg = stats?.weeklyAverageMinutes ?? 0;
  const progressPct = dailyGoal > 0 ? (todayMinutes / dailyGoal) * 100 : 0;

  return (
    <section className="relative rounded-3xl bg-card border border-border/80 p-6 shadow-xs">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {t("home.studyProgress")}
          </h2>
        </div>
        <Link
          to={ROUTES.STATS.url}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          {t("home.viewStats")}
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular ring */}
        <div className="relative shrink-0">
          <CircularProgress value={progressPct} size={96} strokeWidth={8} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {Math.round(progressPct)}%
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {progressPct >= 100 ? "Done" : "Goal"}
            </span>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10 text-primary">
                <Clock size={14} />
              </div>
              <span className="font-medium text-muted-foreground">
                {t("home.todayStudy")}
              </span>
            </div>
            <span className="font-bold tabular-nums text-foreground text-sm">
              {t("home.minutesShort", { count: todayMinutes })}
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target size={14} />
              </div>
              <span className="font-medium text-muted-foreground">
                {t("home.dailyGoal")}
              </span>
            </div>
            <span className="font-bold tabular-nums text-foreground text-sm">
              {t("home.minutesShort", { count: dailyGoal })}
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={14} />
              </div>
              <span className="font-medium text-muted-foreground">
                {t("home.weeklyAverage")}
              </span>
            </div>
            <span className="font-bold tabular-nums text-foreground text-sm">
              {t("home.minutesShort", { count: weeklyAvg })}
            </span>
          </div>
        </div>
      </div>

      {progressPct >= 100 && (
        <div className="mt-4 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
          {t("home.goalReached")}
        </div>
      )}
    </section>
  );
}
