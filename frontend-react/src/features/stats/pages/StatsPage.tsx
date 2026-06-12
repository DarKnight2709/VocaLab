import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { useStatsQuery } from "../api/statsService";
import { StudySummary } from "../components/StudySummary";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { DailyGoalControl } from "../components/DailyGoalControl";
import { WeeklyAverage } from "../components/WeeklyAverage";
import Breadcrumb from "@/shared/components/Breadcrumb";
import { useTranslation } from "@/shared/hooks/useTranslation";

export default function StatsPage() {
  const { t } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch Stats & Goal Data from service
  const { data: stats, isLoading } = useStatsQuery(weekOffset);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-5 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-10 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
          <div className="w-full max-w-md h-96 bg-card rounded-[32px] border" />
        </div>
      </div>
    );
  }

  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoalMinutes = stats?.dailyGoalMinutes ?? 5;
  const weeklyAverageMinutes = stats?.weeklyAverageMinutes ?? 0;
  const chartData = stats?.weeklyActivity ?? [];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: t("vocabulary.title"), href: "/vocabulary" },
          { label: t("stats.title") }
        ]} />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("stats.title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("stats.description")}
            </p>
          </div>
        </div>

        <div className="flex justify-center md:justify-start">
          <Card className="w-full max-w-md rounded-[32px] border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              <StudySummary todayMinutes={todayMinutes} />

              <WeeklyActivityChart 
                chartData={chartData} 
                dailyGoalMinutes={dailyGoalMinutes}
                weekOffset={weekOffset}
                onOffsetChange={setWeekOffset}
              />

              <DailyGoalControl dailyGoalMinutes={dailyGoalMinutes} />

              <WeeklyAverage weeklyAverageMinutes={weeklyAverageMinutes} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
