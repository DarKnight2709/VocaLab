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
    <div className="relative">
      {/* Week navigation buttons */}
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOffsetChange((prev: number) => prev - 1)}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <span className="text-sm font-medium text-muted-foreground">
          {getWeekLabel()}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onOffsetChange((prev: number) => prev + 1)}
          disabled={weekOffset >= 0}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 25, right: 45, left: 0, bottom: 0 }} 
            style={{ overflow: "visible" }}
          >
            <XAxis 
              dataKey="date" 
              stroke="#475569" 
              fontSize={14} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={12}
              tickFormatter={(val) => t(`stats.days.${val}`)}
            />
            
            <YAxis 
              hide 
              domain={[0, Math.max(dailyGoalMinutes * 1.5, ...chartData.map((d: any) => d.minutes))]} 
            />

            <Tooltip 
              cursor={{ fill: '#f1f5f9', radius: 4 }}
              contentStyle={{ background: "hsl(var(--card))", borderRadius: "12px", borderColor: "hsl(var(--border))", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              formatter={(value: any) => [`${value} ${t("stats.min")}`, t("stats.studyTime")]}
              itemStyle={{ color: "#1e293b" }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold", marginBottom: "4px" }}
            />

            {/* TARGET LINE */}
            <ReferenceLine 
              y={dailyGoalMinutes} 
              stroke="#0f172a" 
              strokeWidth={1}
              label={(props: any) => {
                const { viewBox } = props;
                return (
                  <g>
                    <foreignObject x={viewBox.width + 5} y={viewBox.y - 14} width="40" height="40" style={{ overflow: "visible" }}>
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-semibold text-[#64748b] leading-tight whitespace-nowrap">{dailyGoalMinutes} {t("stats.min")}</span>
                        <Target className="h-6 w-6 text-[#0f172a] mt-[2px]" />
                      </div>
                    </foreignObject>
                  </g>
                );
              }}
            />
            
            <Bar 
              dataKey="minutes" 
              barSize={40}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const isToday = weekOffset === 0 && payload.date === todayDayName;
                
                return (
                  <g>
                    {/* Square Grey Column for Today */}
                    {isToday && (
                      <rect 
                        x={x} 
                        y={15} 
                        width={width} 
                        height={y + height - 15} 
                        fill="#f1f5f9"
                      />
                    )}
                    
                    {/* Rounded Progress Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill="#fcd34d" 
                      rx={10} 
                      ry={10}
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
