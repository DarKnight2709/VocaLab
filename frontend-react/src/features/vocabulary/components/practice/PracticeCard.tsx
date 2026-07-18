import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { getFieldValue, normalize } from "../../utils";
import type { CardItem } from "../../api/vocabularyService";

interface PracticeCardProps {
  currentCard: CardItem;
  currentIdx: number;
  totalCards: number;
  practiceFieldIds: Set<string>;
  showFieldIds: Set<string>;
  answers: Record<string, Record<string, string>>;
  revealed: boolean;
  isLastCard: boolean;
  onAnswerChange: (cardId: string, fieldId: string, value: string) => void;
  onReveal: () => void;
  onNext: () => void;
  onCheckResult: () => void;
}

export default function PracticeCard({
  currentCard,
  currentIdx,
  totalCards,
  practiceFieldIds,
  showFieldIds,
  answers,
  revealed,
  isLastCard,
  onAnswerChange,
  onReveal,
  onNext,
  onCheckResult,
}: PracticeCardProps) {
  const { t } = useTranslation();

  // Collect visible fields for this card
  const allFields = (currentCard.cardType?.fields ?? []).sort((a, b) => {
    if (a.side !== b.side) return a.side === "FRONT" ? -1 : 1;
    return a.order - b.order;
  });

  const practiceFieldsOnCard = allFields.filter((f) => practiceFieldIds.has(f.id));
  const allFilled =
    practiceFieldsOnCard.length > 0 &&
    practiceFieldsOnCard.every(
      (f) => (answers[currentCard.id]?.[f.id] ?? "").trim().length > 0
    );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.repeat) return;
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
      
      if (e.currentTarget.value.trim().length === 0) return;

      const formInputs = Array.from(
        document.querySelectorAll('input[data-practice-input="true"]')
      ) as HTMLInputElement[];
      const idx = formInputs.indexOf(e.currentTarget);
      
      if (idx >= 0 && idx < formInputs.length - 1) {
        formInputs[idx + 1].focus();
      } else {
        const allInputsFilled = formInputs.every((input) => input.value.trim().length > 0);
        if (allInputsFilled) {
          onReveal();
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-4 pb-12">
      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-medium">
        <span>
          {t("vocabulary.practiceProgress") || "Card"} {currentIdx + 1} / {totalCards}
        </span>
      </div>

      <div className="rounded-2xl bg-card shadow-sm p-8 min-h-[350px] space-y-6 flex flex-col justify-center">
        {allFields.map((field) => {
          const isPractice = practiceFieldIds.has(field.id);
          const isShow = showFieldIds.has(field.id);
          if (!isPractice && !isShow) return null;

          const correctValue = getFieldValue(currentCard, field.id);
          const userAnswer = answers[currentCard.id]?.[field.id] ?? "";

          return (
            <div key={field.id} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {field.label}
              </label>

              {isShow && (
                <div
                  className="text-base whitespace-pre-line leading-snug"
                  style={{
                    color: field.color || "inherit",
                    fontSize: field.fontSize ? `${field.fontSize}px` : "inherit",
                  }}
                >
                  {correctValue || (
                    <span className="text-muted-foreground italic text-xs">
                      {t("vocabulary.emptyFieldValue")}
                    </span>
                  )}
                </div>
              )}

              {isPractice && !revealed && (
                <Input
                  placeholder={`${t("vocabulary.typeAnswer") || "Type your answer"}...`}
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(currentCard.id, field.id, e.target.value)}
                  className="text-base"
                  autoComplete="off"
                  data-practice-input="true"
                  onKeyDown={handleInputKeyDown}
                  autoFocus={practiceFieldsOnCard[0]?.id === field.id}
                />
              )}

              {isPractice && revealed && (
                <div className="space-y-1.5">
                  <div
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      normalize(userAnswer) === normalize(correctValue)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-destructive bg-destructive/10 text-destructive"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-bold block mb-0.5 opacity-70">
                      {t("vocabulary.yourAnswer") || "Your Answer"}
                    </span>
                    {userAnswer || (
                      <span className="italic opacity-50">({t("vocabulary.emptyFieldValue")})</span>
                    )}
                  </div>
                  {normalize(userAnswer) !== normalize(correctValue) && (
                    <div className="rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <span className="text-[10px] uppercase tracking-widest font-bold block mb-0.5 opacity-70">
                        {t("vocabulary.correctAnswer") || "Correct Answer"}
                      </span>
                      {correctValue}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-3">
        {!revealed ? (
          <Button size="lg" className="w-44" onClick={onReveal} disabled={!allFilled}>
            {t("vocabulary.showAnswer") || "Show Answer"}
          </Button>
        ) : isLastCard ? (
          <Button size="lg" className="w-44 gap-1.5 font-semibold" onClick={onCheckResult}>
            <CheckCircle2 className="h-4 w-4" />
            {t("vocabulary.checkResult") || "Check Result"}
          </Button>
        ) : (
          <Button size="lg" className="w-44 gap-1.5" onClick={onNext}>
            {t("vocabulary.next") || "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
