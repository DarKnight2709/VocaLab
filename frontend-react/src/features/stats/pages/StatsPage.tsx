import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { useStatsQuery } from "../api/statsService";
import { StatsHeader } from "../components/StatsHeader";
import { StudySummary } from "../components/StudySummary";
import { WeeklyActivityChart } from "../components/WeeklyActivityChart";
import { DailyGoalControl } from "../components/DailyGoalControl";
import { WeeklyAverage } from "../components/WeeklyAverage";

export default function StatsPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch Stats & Goal Data from service
  const { data: stats, isLoading } = useStatsQuery(weekOffset);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex justify-center">
        <div className="w-full max-w-md animate-pulse bg-card h-96 rounded-3xl" />
      </div>
    );
  }

  const todayMinutes = stats?.todayMinutes ?? 0;
  const dailyGoalMinutes = stats?.dailyGoalMinutes ?? 5;
  const weeklyAverageMinutes = stats?.weeklyAverageMinutes ?? 0;
  const chartData = stats?.weeklyActivity ?? [];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 flex justify-center">
      <Card className="w-full max-w-md rounded-[32px] border bg-card p-6 shadow-sm">
        
        <StatsHeader />
        
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
  );
}