import { useState, useMemo } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { HistoryActivity } from "@/shared/validations/ProgressSchema";

interface HeatMapChartProps {
  history: HistoryActivity[];
}

export const HeatMapChart = ({ history }: HeatMapChartProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  const blocks = useMemo(() => {
    // Determine leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const numDays = isLeapYear ? 366 : 365;
    
    // Map sparse history to lookup
    const historyMap = new Map<string, HistoryActivity>();
    if (history) {
      history.forEach(item => {
        historyMap.set(item.date, item);
      });
    }

    const yearBlocks = [];
    
    // Pre-pad with nulls for correct starting day of the week (Sun=0)
    const firstDate = new Date(year, 0, 1);
    const startDayOfWeek = firstDate.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      yearBlocks.push(null);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Add days
    for (let i = 0; i < numDays; i++) {
      const d = new Date(year, 0, 1 + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const record = historyMap.get(dateStr);
      
      yearBlocks.push({
        date: dateStr,
        isToday: dateStr === todayStr,
        count: record?.count || 0,
        cardsReviewed: record?.cardsReviewed || 0,
        cardsAdded: record?.cardsAdded || 0,
        cardsUpdated: record?.cardsUpdated || 0,
        cardsDeleted: record?.cardsDeleted || 0,
      });
    }

    return yearBlocks;
  }, [history, year]);

  // Color logic
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-[#ebedf0] dark:bg-slate-800";
    if (count < 20) return "bg-[#c6e48b] dark:bg-[#c6e48b]/80";
    if (count < 50) return "bg-[#7bc96f] dark:bg-[#7bc96f]/80";
    if (count < 100) return "bg-[#239a3b] dark:bg-[#239a3b]/80";
    return "bg-[#196127] dark:bg-[#196127]/80";
  };

  return (
    <Card className="rounded-2xl bg-card shadow-sm p-6 shadow-sm flex flex-col w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">{t("stats.activityHeatMap") || "Activity Heat Map"}</h3>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setYear(prev => prev - 1)}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{year}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setYear(prev => prev + 1)}
            disabled={year >= currentYear}
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[700px] flex gap-2 pt-14">
          {/* Day Labels */}
          <div className="flex flex-col justify-between text-[11px] text-slate-400 py-[2px] font-medium select-none pr-1 h-full">
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Mon</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Wed</span>
            <span className="h-[14px]"></span>
            <span className="h-[14px] leading-[14px]">Fri</span>
            <span className="h-[14px]"></span>
          </div>

          {/* Grid */}
          <div 
            className="grid grid-rows-7 gap-[3px] flex-1"
            style={{ gridAutoFlow: "column", gridAutoColumns: "max-content" }}
          >
            {blocks.map((block, index) => {
              if (!block) {
                return <div key={`empty-${index}`} className="w-[14px] h-[14px] rounded-[3px] bg-transparent" />;
              }

              const { date, count, isToday, cardsReviewed, cardsAdded, cardsUpdated, cardsDeleted } = block;
              const dateObj = new Date(date);
              const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              
              const hasActivity = cardsReviewed > 0 || cardsAdded > 0 || cardsUpdated > 0 || cardsDeleted > 0;

              return (
                <div 
                  key={date} 
                  className={`w-[14px] h-[14px] rounded-[4px] transition-colors cursor-pointer hover:ring-2 hover:ring-[#0096ff] hover:z-20 group relative ${getColorClass(count)} ${isToday ? 'ring-2 ring-slate-900 dark:ring-slate-400' : ''}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1b1f24] text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 min-w-max">
                    <div className="text-[12px] font-bold pb-1 mb-1 border-b border-slate-700/50">{dateString}</div>
                    <div className="text-[11px] text-slate-300 flex flex-col gap-0.5">
                      {hasActivity ? (
                        <>
                          {cardsReviewed > 0 && <div>{cardsReviewed} {t("stats.cardsReviewedStr") || "cards reviewed"}</div>}
                          {cardsAdded > 0 && <div>{cardsAdded} cards added</div>}
                          {cardsUpdated > 0 && <div>{cardsUpdated} cards updated</div>}
                          {cardsDeleted > 0 && <div>{cardsDeleted} cards deleted</div>}
                        </>
                      ) : (
                        <div>{t("stats.noActivity") || "No activity"}</div>
                      )}
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1b1f24]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500 font-medium mt-1 pr-2">
        <span className="mr-1">Less</span>
        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#ebedf0] dark:bg-slate-800" />
        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#c6e48b] dark:bg-[#c6e48b]/80" />
        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#7bc96f] dark:bg-[#7bc96f]/80" />
        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#239a3b] dark:bg-[#239a3b]/80" />
        <div className="w-[14px] h-[14px] rounded-[3px] bg-[#196127] dark:bg-[#196127]/80" />
        <span className="ml-1">More</span>
      </div>
    </Card>
  );
};
