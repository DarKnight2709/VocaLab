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
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.72 0.19 155)" />
          <stop offset="100%" stopColor="oklch(0.63 0.24 145)" />
        </linearGradient>
      </defs>
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
  const dailyGoal = stats?.dailyGoalMinutes ?? 5;
  const weeklyAvg = stats?.weeklyAverageMinutes ?? 0;
  const progressPct = dailyGoal > 0 ? (todayMinutes / dailyGoal) * 100 : 0;

  return (
    <section className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {t("home.studyProgress")}
        </h2>
        <Link
          to={ROUTES.STATS.url}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("home.viewStats")}
          <ArrowRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular ring */}
        <div className="relative">
          <CircularProgress value={progressPct} size={88} strokeWidth={7} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold tabular-nums">
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t("home.todayStudy")}
            </span>
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {t("home.minutesShort", { count: todayMinutes })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t("home.dailyGoal")}
            </span>
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {t("home.minutesShort", { count: dailyGoal })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t("home.weeklyAverage")}
            </span>
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {t("home.minutesShort", { count: weeklyAvg })}
            </span>
          </div>
        </div>
      </div>

      {progressPct >= 100 && (
        <p className="mt-3 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {t("home.goalReached")}
        </p>
      )}
    </section>
  );
}
