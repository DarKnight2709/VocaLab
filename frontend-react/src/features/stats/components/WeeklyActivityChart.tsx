import { Button } from "@/shared/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type WeekActivity } from "@/shared/validations/ProgressSchema";

interface WeeklyActivityChartProps {
  chartData: WeekActivity[];
  dailyGoalMinutes: number;
  weekOffset: number;
  onOffsetChange: (offset: number | ((prev: number) => number)) => void;
}

export const WeeklyActivityChart = ({ 
  chartData, 
  dailyGoalMinutes, 
  weekOffset, 
  onOffsetChange 
}: WeeklyActivityChartProps) => {
  const { t } = useTranslation();

  const getWeekLabel = () => {
    if (weekOffset === 0) return t("stats.thisWeek");
    if (weekOffset === -1) return t("stats.lastWeek");
    if (weekOffset < 0) return t("stats.weeksAgo", { count: Math.abs(weekOffset) });
    return t("stats.weeksAhead", { count: weekOffset });
  };

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="relative space-y-2">
      {/* Week navigation buttons */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOffsetChange((prev: number) => prev - 1)}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/60">
          {getWeekLabel()}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOffsetChange((prev: number) => prev + 1)}
          disabled={weekOffset >= 0}
          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-[210px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 25, right: 50, left: 0, bottom: 0 }} 
            style={{ overflow: "visible" }}
          >
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              fontWeight={500}
              tickLine={false} 
              axisLine={false} 
              tickMargin={10}
              tickFormatter={(val) => t(`stats.days.${val}`)}
            />
            
            <YAxis 
              hide 
              domain={[0, Math.max(dailyGoalMinutes * 1.5, ...chartData.map((d: any) => d.minutes))]} 
            />

            <Tooltip 
              cursor={{ fill: 'currentColor', opacity: 0.04 }}
              contentStyle={{ 
                background: "hsl(var(--card))", 
                borderRadius: "16px", 
                borderColor: "hsl(var(--border))", 
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)",
                padding: "8px 12px",
              }}
              formatter={(value: any) => [`${value} ${t("stats.min")}`, t("stats.studyTime")]}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}
            />

            {/* TARGET LINE */}
            <ReferenceLine 
              y={dailyGoalMinutes} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={(props: any) => {
                const { viewBox } = props;
                return (
                  <g>
                    <foreignObject x={viewBox.width + 6} y={viewBox.y - 14} width="44" height="40" style={{ overflow: "visible" }}>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-primary leading-tight whitespace-nowrap bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{dailyGoalMinutes}m</span>
                        <Target className="h-3.5 w-3.5 text-primary mt-0.5" />
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            
            <Bar 
              dataKey="minutes" 
              barSize={36}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const isToday = weekOffset === 0 && payload.date === todayDayName;
                const reachedGoal = payload.minutes >= dailyGoalMinutes;
                
                return (
                  <g>
                    {/* Today highlight column indicator */}
                    {isToday && (
                      <rect 
                        x={x - 2} 
                        y={10} 
                        width={width + 4} 
                        height={y + height - 10} 
                        fill="currentColor"
                        opacity={0.06}
                        rx={10}
                      />
                    )}
                    
                    {/* Progress Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill={reachedGoal ? "#10b981" : "#3b82f6"} 
                      rx={8} 
                      ry={8}
                    />
                  </g>
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
