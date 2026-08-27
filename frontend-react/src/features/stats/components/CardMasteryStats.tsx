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
  const newPercent = totalCards > 0 ? Math.max(0, 100 - masteredPercent - learningPercent) : 0;

  return (
    <Card className="rounded-3xl bg-card border border-border/80 shadow-xs p-6 space-y-6 w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-500 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("stats.totalCards") || "Total Cards"}
            </span>
            <div className="text-2xl font-bold text-foreground">
              {totalCards}
            </div>
          </div>
        </div>

        {totalCards > 0 && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {masteredPercent}% {t("stats.masteredCards") || "Mastered"}
          </span>
        )}
      </div>

      {/* Progress & Breakdown */}
      <div className="space-y-4">
        {/* Multi-segmented Progress bar on a single row */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            {t("stats.masteryProgress", { defaultValue: "Mastery Progress" })}
          </span>
          <div className="h-3 w-full bg-muted/60 rounded-full flex overflow-hidden p-0.5 border border-border/40 flex-1">
            <div 
              className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
              style={{ width: `${masteredPercent}%` }} 
              title={`Mastered: ${masteredCards} (${masteredPercent}%)`}
            />
            <div 
              className="bg-amber-500 h-full transition-all duration-500" 
              style={{ width: `${learningPercent}%` }} 
              title={`Learning: ${learningCards} (${learningPercent}%)`}
            />
            <div 
              className="bg-muted-foreground/30 h-full rounded-r-full transition-all duration-500" 
              style={{ width: `${newPercent}%` }} 
              title={`New: ${newCards} (${newPercent}%)`}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            {masteredCards} / {totalCards}
          </span>
        </div>

        {/* 3 Detailed breakdown tiles */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("stats.masteredCards") || "Mastered"}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{masteredCards}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">
              <Brain className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("stats.learningCards") || "Learning"}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{learningCards}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("stats.newCards") || "New"}</span>
            </div>
            <div className="text-xl font-bold text-foreground">{newCards}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
