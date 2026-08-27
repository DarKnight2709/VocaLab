import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { HistoryActivity } from "@/shared/validations/ProgressSchema";
import { getLocalDateStr } from "@/shared/lib/utils";

interface HeatMapChartProps {
  history: HistoryActivity[];
}

interface HoveredTooltipInfo {
  dateString: string;
  cardsReviewed: number;
  cardsAdded: number;
  cardsUpdated: number;
  cardsDeleted: number;
  hasActivity: boolean;
  rect: DOMRect;
}

export const HeatMapChart = ({ history }: HeatMapChartProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [hoveredInfo, setHoveredInfo] = useState<HoveredTooltipInfo | null>(null);
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

    const todayStr = getLocalDateStr();

    // Add days
    for (let i = 0; i < numDays; i++) {
      const d = new Date(year, 0, 1 + i);
      const dateStr = getLocalDateStr(d);
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
    if (count === 0) return "bg-muted/60 dark:bg-muted/40 hover:bg-muted";
    if (count < 20) return "bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300";
    if (count < 50) return "bg-emerald-400 dark:bg-emerald-700/80";
    if (count < 100) return "bg-emerald-500 dark:bg-emerald-500";
    return "bg-emerald-700 dark:bg-emerald-400";
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <Card className="rounded-3xl bg-card border border-border/80 shadow-xs p-6 flex flex-col w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("stats.activityHeatMap") || "Activity Heat Map"}</h3>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setYear(prev => prev - 1)}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold w-12 text-center text-foreground">{year}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setYear(prev => prev + 1)}
            disabled={year >= currentYear}
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="min-w-[720px] flex flex-col gap-2">
          {/* Months header */}
          <div className="flex justify-between text-xs font-semibold text-muted-foreground pl-8 pr-2 select-none">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day Labels */}
            <div className="flex flex-col justify-between text-[11px] text-muted-foreground py-0.5 font-medium select-none pr-1">
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
              {blocks.map((block) => {
                if (!block) {
                  return <div key={Math.random()} className="w-[14px] h-[14px] rounded-[3px] bg-transparent" />;
                }

                const { date, count, isToday, cardsReviewed, cardsAdded, cardsUpdated, cardsDeleted } = block;
                const [yyyy, mm, dd] = date.split('-').map(Number);
                const dateObj = new Date(yyyy, mm - 1, dd);
                const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                
                const hasActivity = cardsReviewed > 0 || cardsAdded > 0 || cardsUpdated > 0 || cardsDeleted > 0;

                return (
                  <div 
                    key={date} 
                    className={`w-[14px] h-[14px] rounded-[4px] transition-all cursor-pointer hover:ring-2 hover:ring-primary hover:scale-125 ${getColorClass(count)} ${isToday ? 'ring-2 ring-primary' : ''}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredInfo({
                        dateString,
                        cardsReviewed,
                        cardsAdded,
                        cardsUpdated,
                        cardsDeleted,
                        hasActivity,
                        rect,
                      });
                    }}
                    onMouseLeave={() => setHoveredInfo(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground font-medium pr-2">
        <span className="mr-1">Less</span>
        <div className="w-3.5 h-3.5 rounded-[3px] bg-muted/60 dark:bg-muted/40" />
        <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-200 dark:bg-emerald-950/80" />
        <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-400 dark:bg-emerald-700/80" />
        <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-500 dark:bg-emerald-500" />
        <div className="w-3.5 h-3.5 rounded-[3px] bg-emerald-700 dark:bg-emerald-400" />
        <span className="ml-1">More</span>
      </div>

      {/* Floating Tooltip Rendered via Portal (Never Clipped!) */}
      {hoveredInfo && typeof document !== "undefined" && createPortal(
        (() => {
          const isNearTop = hoveredInfo.rect.top < 150;
          const top = isNearTop 
            ? hoveredInfo.rect.bottom + 8 
            : hoveredInfo.rect.top - 8;
          const left = Math.max(120, Math.min(window.innerWidth - 120, hoveredInfo.rect.left + hoveredInfo.rect.width / 2));
          const transform = isNearTop 
            ? "translate(-50%, 0)" 
            : "translate(-50%, -100%)";

          return (
            <div 
              className="fixed z-9999 pointer-events-none px-3.5 py-2.5 bg-popover text-popover-foreground border border-border/80 shadow-2xl rounded-2xl min-w-max text-xs transition-opacity duration-150 animate-in fade-in-0 zoom-in-95"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                transform,
              }}
            >
              <div className="font-bold text-[12px] pb-1 mb-1.5 border-b border-border/60 text-foreground">{hoveredInfo.dateString}</div>
              <div className="text-[11px] text-muted-foreground flex flex-col gap-1 font-medium">
                {hoveredInfo.hasActivity ? (
                  <>
                    {hoveredInfo.cardsReviewed > 0 && (
                      <div className="text-foreground font-semibold flex items-center justify-between gap-3">
                        <span>{t("stats.cardsReviewedStr") || "cards reviewed"}</span>
                        <span className="text-primary font-bold">{hoveredInfo.cardsReviewed}</span>
                      </div>
                    )}
                    {hoveredInfo.cardsAdded > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span>cards added</span>
                        <span className="font-semibold text-foreground">{hoveredInfo.cardsAdded}</span>
                      </div>
                    )}
                    {hoveredInfo.cardsUpdated > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span>cards updated</span>
                        <span className="font-semibold text-foreground">{hoveredInfo.cardsUpdated}</span>
                      </div>
                    )}
                    {hoveredInfo.cardsDeleted > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <span>cards deleted</span>
                        <span className="font-semibold text-foreground">{hoveredInfo.cardsDeleted}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div>{t("stats.noActivity") || "No activity"}</div>
                )}
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </Card>
  );
};
