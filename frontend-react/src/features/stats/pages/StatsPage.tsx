import { useState } from "react";
import { useStatsQuery } from "../api/statsService";
import { StudySummary } from "../components/StudySummary";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { DailyGoalControl } from "../components/DailyGoalControl";
import { WeeklyAverage } from "../components/WeeklyAverage";
import { StreakCard } from "../components/StreakCard";
import { CardMasteryStats } from "../components/CardMasteryStats";
import { HeatMapChart } from "../components/HeatMapChart";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Card } from "@/shared/components/ui/card";

export default function StatsPage() {
  const { t } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch Stats & Goal Data from service
  const { data: stats, isLoading } = useStatsQuery(weekOffset);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-10 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full h-48 bg-card rounded-2xl border" />
            <div className="w-full h-48 bg-card rounded-2xl border" />
          </div>
          <div className="w-full h-64 bg-card rounded-2xl border" />
        </div>
      </div>
    );
  }

  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoalMinutes = stats?.dailyGoalMinutes ?? 5;
  const weeklyAverageMinutes = stats?.weeklyAverageMinutes ?? 0;
  const chartData = stats?.weeklyActivity ?? [];
  const history = stats?.history ?? [];

  return (
    <div className="h-full overflow-y-scroll p-6 md:p-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
        <Breadcrumb items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          { label: t("stats.title") }
        ]} />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("stats.title")}</h1>
            <p className="text-base text-muted-foreground mt-1">
              {t("stats.description")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Time & Weekly Activity */}
          <div className="flex flex-col gap-6">
            <Card className="rounded-2xl bg-card shadow-sm p-6 shadow-sm flex flex-col gap-6">
              <StudySummary todayMinutes={todayMinutes} />
              
              <WeeklyActivityChart 
                chartData={chartData} 
                dailyGoalMinutes={dailyGoalMinutes}
                weekOffset={weekOffset}
                onOffsetChange={setWeekOffset}
              />

              <DailyGoalControl dailyGoalMinutes={dailyGoalMinutes} />
              <WeeklyAverage weeklyAverageMinutes={weeklyAverageMinutes} />
            </Card>
          </div>
          
          {/* Right Column: Streaks & Mastery */}
          <div className="flex flex-col gap-6">
            <StreakCard 
              currentStreak={stats?.currentStreak ?? 0}
              maxStreak={stats?.maxStreak ?? 0}
              totalDays={stats?.totalDays ?? 0}
              totalMinutes={stats?.totalMinutes ?? 0}
            />

            <CardMasteryStats 
              totalCards={stats?.totalCards ?? 0}
              masteredCards={stats?.masteredCards ?? 0}
              learningCards={stats?.learningCards ?? 0}
              newCards={stats?.newCards ?? 0}
            />
          </div>
        </div>

        {/* Bottom: Heat Map */}
        <HeatMapChart history={history} />
      </div>
    </div>
  );
}
