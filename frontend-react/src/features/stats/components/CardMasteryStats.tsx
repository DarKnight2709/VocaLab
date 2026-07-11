import { Layers, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { useTranslation } from "@/shared/hooks/useTranslation";

interface CardMasteryStatsProps {
  totalCards: number;
  masteredCards: number;
  learningCards: number;
  newCards: number;
}

export const CardMasteryStats = ({
  totalCards,
  masteredCards,
  learningCards,
  newCards,
}: CardMasteryStatsProps) => {
  const { t } = useTranslation();

  const masteredPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const learningPercent = totalCards > 0 ? Math.round((learningCards / totalCards) * 100) : 0;
  const newPercent = totalCards > 0 ? Math.round((newCards / totalCards) * 100) : 0;

  return (
    <Card className="rounded-[32px] border bg-card p-6 shadow-sm flex flex-col gap-6 w-full h-full justify-center">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-500">
          <Layers className="h-8 w-8" />
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t("stats.totalCards") || "Total Cards"}
          </div>
          <div className="text-3xl font-bold">
            {totalCards}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress bar */}
        <div className="h-3 w-full bg-muted rounded-full flex overflow-hidden">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${masteredPercent}%` }} />
          <div className="bg-amber-500 h-full transition-all" style={{ width: `${learningPercent}%` }} />
          <div className="bg-slate-300 dark:bg-slate-700 h-full transition-all" style={{ width: `${newPercent}%` }} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("stats.masteredCards") || "Mastered"}
            </div>
            <div className="text-xl font-bold">{masteredCards}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Brain className="h-3.5 w-3.5" />
              {t("stats.learningCards") || "Learning"}
            </div>
            <div className="text-xl font-bold">{learningCards}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              {t("stats.newCards") || "New"}
            </div>
            <div className="text-xl font-bold">{newCards}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
