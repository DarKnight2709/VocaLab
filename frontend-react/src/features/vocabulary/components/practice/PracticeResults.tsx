import { CheckCircle2, XCircle, RotateCcw, ListRestart, Settings2, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { getFieldValue } from "../../utils";
import type { CardItem } from "../../api/vocabularyService";
import type { PracticeResult } from "../../types";
import type { CardField } from "@/shared/validations/VocabularySchema";

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
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-card shadow-sm space-y-3">
        <div className="text-4xl">{percentage >= 80 ? "🎉" : percentage >= 50 ? "💪" : "📝"}</div>
        <h2 className="text-xl font-bold">
          {t("vocabulary.practiceComplete") || "Practice Complete!"}
        </h2>
        <div className="text-3xl font-bold tracking-tight">
          {correctCount} / {practiceCards.length}
          <span className="text-base font-normal text-muted-foreground ml-2">({percentage}%)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.correctCount") || "cards answered correctly"}
        </p>
      </div>

      {/* Retry buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button variant="outline" className="gap-1.5 font-semibold" onClick={onTryAgain}>
          <RotateCcw className="h-4 w-4" />
          {t("vocabulary.tryAgain") || "Try Again"}
        </Button>
        {wrongCount > 0 && (
          <Button variant="default" className="gap-1.5 font-semibold" onClick={onTryWrongOnes}>
            <ListRestart className="h-4 w-4" />
            {t("vocabulary.tryWrongOnes") || "Try Wrong Ones"} ({wrongCount})
          </Button>
        )}
        <Button variant="secondary" className="gap-1.5 font-semibold" onClick={onSetup}>
          <Settings2 className="h-4 w-4" />
          {t("vocabulary.practiceSetup") || "Practice Setup"}
        </Button>
        {onFinish && (
          <Button variant="secondary" className="gap-1.5 font-semibold" onClick={onFinish}>
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
                <div key={fid} className="text-sm mb-1">
                  <span className="font-medium">{label}:</span>{" "}
                  <span className="text-muted-foreground">{val}</span>
                </div>
              );
            })}

            {/* Show practice field results */}
            {r.fieldResults.map((fr) => {
              const label = fieldMap.get(fr.fieldId)?.label ?? fr.fieldId;
              return (
                <div key={fr.fieldId} className="text-sm mt-1">
                  <span className="font-medium">{label}:</span>{" "}
                  {fr.isCorrect ? (
                    <span className="text-emerald-600">{fr.userAnswer}</span>
                  ) : (
                    <>
                      <span className="line-through text-destructive mr-1.5">
                        {fr.userAnswer || `(${t("vocabulary.emptyFieldValue")})`}
                      </span>
                      <span className="text-emerald-600">→ {fr.correct}</span>
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
