import { useState } from "react";
import { useStatsQuery } from "../api/statsService";
import { StudySummary } from "../components/StudySummary";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { DailyGoalControl } from "../components/DailyGoalControl";
import { WeeklyAverage } from "../components/WeeklyAverage";
import { CardMasteryStats } from "../components/CardMasteryStats";
import { HeatMapChart } from "../components/HeatMapChart";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Card } from "@/shared/components/ui/card";
import { Clock, Flame, Layers, Timer } from "lucide-react";

export default function StatsPage() {
  const { t } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch Stats & Goal Data from service
  const { data: stats, isLoading } = useStatsQuery(weekOffset);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
          <div className="h-5 w-48 bg-muted/60 rounded-lg" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded-xl" />
            <div className="h-4 w-96 bg-muted/60 rounded-lg" />
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-card rounded-3xl border border-border/80" />
            ))}
          </div>
          <div className="w-full h-80 bg-card rounded-3xl border border-border/80" />
          <div className="w-full h-56 bg-card rounded-3xl border border-border/80" />
          <div className="w-full h-64 bg-card rounded-3xl border border-border/80" />
        </div>
      </div>
    );
  }

  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoalMinutes = stats?.dailyGoalMinutes ?? 5;
  const weeklyAverageMinutes = stats?.weeklyAverageMinutes ?? 0;
  const chartData = stats?.weeklyActivity ?? [];
  const history = stats?.history ?? [];

  const totalMinutes = stats?.totalMinutes ?? 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalTimeString = totalHours > 0 
    ? `${totalHours}h ${remainingMinutes}m` 
    : `${totalMinutes}m`;

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">
        <Breadcrumb items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          { label: t("stats.title") }
        ]} />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("stats.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("stats.description")}
            </p>
          </div>
        </div>

        {/* Top 4 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Today */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.today")}
              </span>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {todayMinutes} <span className="text-sm font-normal text-muted-foreground">{t("stats.min")}</span>
              </div>
              <div className="text-[11px] font-semibold text-primary">
                {t("stats.dailyGoal")}: {dailyGoalMinutes}m
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* 2. Streak */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.currentStreak") || "Current Streak"}
              </span>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats?.currentStreak ?? 0} <span className="text-sm font-normal text-muted-foreground">{t("stats.daysCount") || "days"}</span>
              </div>
              <div className="text-[11px] font-semibold text-orange-500">
                {t("stats.maxStreak") || "Best"}: {stats?.maxStreak ?? 0}d
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shrink-0">
              <Flame className="h-5 w-5" />
            </div>
          </div>

          {/* 3. Total Cards */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.totalCards") || "Total Cards"}
              </span>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {stats?.totalCards ?? 0}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {stats?.masteredCards ?? 0} {t("stats.masteredCards") || "mastered"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          {/* 4. Total Time */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.totalTime") || "Total Time"}
              </span>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {totalTimeString}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {stats?.totalDays ?? 0} {t("stats.daysCount") || "days active"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <Timer className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Main Sections: Each occupying its own full-width row */}
        <div className="flex flex-col gap-6">
          {/* Row 1: Time & Weekly Activity */}
          <Card className="rounded-3xl bg-card border border-border/80 shadow-xs p-6 space-y-6 w-full">
            <StudySummary todayMinutes={todayMinutes} />
            
            <WeeklyActivityChart 
              chartData={chartData} 
              dailyGoalMinutes={dailyGoalMinutes}
              weekOffset={weekOffset}
              onOffsetChange={setWeekOffset}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <WeeklyAverage weeklyAverageMinutes={weeklyAverageMinutes} />
              <DailyGoalControl dailyGoalMinutes={dailyGoalMinutes} />
            </div>
          </Card>
          
          {/* Row 2: Card Mastery & Retention */}
          <CardMasteryStats 
            totalCards={stats?.totalCards ?? 0}
            masteredCards={stats?.masteredCards ?? 0}
            learningCards={stats?.learningCards ?? 0}
            newCards={stats?.newCards ?? 0}
          />

          {/* Row 3: Heat Map */}
          <HeatMapChart history={history} />
        </div>
      </div>
    </div>
  );
}
