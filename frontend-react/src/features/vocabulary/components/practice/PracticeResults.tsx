import { CheckCircle2, XCircle, RotateCcw, ListRestart, Settings2, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { getFieldValue } from "../../utils";
import type { CardItem } from "../../api/vocabularyService";
import type { PracticeResult } from "../../types";
import type { CardField } from "@/shared/validations/VocabularySchema";
import FormattedFieldValue from "../FormattedFieldValue";

interface PracticeResultsProps {
  practiceCards: CardItem[];
  correctCount: number;
  results: PracticeResult[];
  showFieldIds: Set<string>;
  fieldMap: Map<string, CardField>;
  onTryAgain: () => void;
  onTryWrongOnes: () => void;
  onSetup: () => void;
  onFinish?: () => void;
}

export default function PracticeResults({
  practiceCards,
  correctCount,
  results,
  showFieldIds,
  fieldMap,
  onTryAgain,
  onTryWrongOnes,
  onSetup,
  onFinish,
}: PracticeResultsProps) {
  const { t } = useTranslation();
  const percentage = practiceCards.length > 0 ? Math.round((correctCount / practiceCards.length) * 100) : 0;
  const wrongCount = practiceCards.length - correctCount;

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-4">
      {/* Score header */}
      <div className="relative flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-card border border-border/80 shadow-xs space-y-3.5">
        <div className="text-5xl">{percentage >= 80 ? "🎉" : percentage >= 50 ? "💪" : "📝"}</div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("vocabulary.practiceComplete") || "Practice Complete!"}
        </h2>
        <div className="inline-flex items-center gap-2 bg-muted/60 px-6 py-2 rounded-2xl border border-border/60 shadow-xs">
          <span className="text-3xl font-extrabold text-foreground">{correctCount} / {practiceCards.length}</span>
          <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
            percentage >= 80 
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" 
              : percentage >= 50 
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" 
                : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
          }`}>
            {percentage}%
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {t("vocabulary.correctCount") || "cards answered correctly"}
        </p>
      </div>

      {/* Retry buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button 
          variant="outline" 
          className="gap-1.5 font-semibold rounded-xl" 
          onClick={onTryAgain}
        >
          <RotateCcw className="h-4 w-4" />
          {t("vocabulary.tryAgain") || "Try Again"}
        </Button>
        {wrongCount > 0 && (
          <Button 
            className="gap-1.5 font-semibold rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-xs" 
            onClick={onTryWrongOnes}
          >
            <ListRestart className="h-4 w-4" />
            {t("vocabulary.tryWrongOnes") || "Try Wrong Ones"} ({wrongCount})
          </Button>
        )}
        <Button 
          variant="secondary" 
          className="gap-1.5 font-semibold rounded-xl" 
          onClick={onSetup}
        >
          <Settings2 className="h-4 w-4" />
          {t("vocabulary.practiceSetup") || "Practice Setup"}
        </Button>
        {onFinish && (
          <Button 
            className="gap-1.5 font-semibold rounded-xl shadow-xs" 
            onClick={onFinish}
          >
            <Check className="h-4 w-4" />
            {t("vocabulary.finish") || "Finish"}
          </Button>
        )}
      </div>

      {/* Detailed results per card */}
      <div className="space-y-2">
        {results.map((r, idx) => (
          <div
            key={r.card.id}
            className={`rounded-xl border p-4 transition-colors ${
              r.allCorrect
                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {r.allCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-xs font-semibold text-muted-foreground">
                {t("vocabulary.practiceCardLabel") || "Card"} {idx + 1}
              </span>
            </div>

            {/* Show show-fields as context */}
            {Array.from(showFieldIds).map((fid) => {
              const label = fieldMap.get(fid)?.label ?? fid;
              const val = getFieldValue(r.card, fid);
              if (!val) return null;
              return (
                <div key={fid} className="text-base md:text-lg mb-1.5 font-medium">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1.5">{label}:</span>{" "}
                  <span className="text-foreground"><FormattedFieldValue text={val} /></span>
                </div>
              );
            })}

            {/* Show practice field results */}
            {r.fieldResults.map((fr) => {
              const label = fieldMap.get(fr.fieldId)?.label ?? fr.fieldId;
              return (
                <div key={fr.fieldId} className="text-base md:text-lg mt-1.5 font-medium">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1.5">{label}:</span>{" "}
                  {fr.isCorrect ? (
                    <span className="text-emerald-600 font-semibold"><FormattedFieldValue text={fr.userAnswer} /></span>
                  ) : (
                    <>
                      <span className="line-through text-destructive mr-2">
                        {fr.userAnswer ? <FormattedFieldValue text={fr.userAnswer} /> : `(${t("vocabulary.emptyFieldValue")})`}
                      </span>
                      <span className="text-emerald-600 font-semibold">→ <FormattedFieldValue text={fr.correct} /></span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
