import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { getFieldValue, normalize } from "../../utils";
import type { CardItem } from "../../api/vocabularyService";
import { useLayoutStore } from "@/shared/stores/useLayoutStore";
import FormattedFieldValue from "../FormattedFieldValue";

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
  const { isFocusMode } = useLayoutStore();

  // Collect visible fields for this card
  const allFields = (currentCard.cardType?.fields ?? []).sort((a, b) => {
    if (a.side !== b.side) return a.side === "FRONT" ? -1 : 1;
    return a.order - b.order;
  });

  const practiceFieldsOnCard = allFields.filter((f) => practiceFieldIds.has(f.id));
  const allFilled =
    practiceFieldsOnCard.length > 0 &&
    practiceFieldsOnCard.every(
      (f) => (answers[currentCard.id]?.[f.id] ?? "").length > 0
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
      if (e.currentTarget.value.length === 0) return;

      const formInputs = Array.from(
        document.querySelectorAll('input[data-practice-input="true"]')
      ) as HTMLInputElement[];
      const idx = formInputs.indexOf(e.currentTarget);
      
      if (idx >= 0 && idx < formInputs.length - 1) {
        formInputs[idx + 1].focus();
      } else {
        const allInputsFilled = formInputs.every((input) => input.value.length > 0);
        if (allInputsFilled) {
          onReveal();
        }
      }
    }
  };

  return (
    <div className={`${isFocusMode ? "max-w-none px-0 md:px-12" : "max-w-3xl"} w-full mx-auto space-y-6 mt-4 pb-12`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-widest font-medium">
        <span>
          {t("vocabulary.practiceProgress") || "Card"} {currentIdx + 1} / {totalCards}
        </span>
      </div>

      <div className={`relative rounded-3xl bg-card border border-border/80 shadow-xs p-8 ${isFocusMode ? "min-h-[65vh]" : "min-h-[350px]"} space-y-6 flex flex-col justify-center`}>
        {allFields.map((field) => {
          const isPractice = practiceFieldIds.has(field.id);
          const isShow = showFieldIds.has(field.id);
          if (!isPractice && !isShow) return null;

          const correctValue = getFieldValue(currentCard, field.id);
          const userAnswer = answers[currentCard.id]?.[field.id] ?? "";

          return (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">
                  {field.label}
                </span>
              </div>

              {isShow && (
                <div
                  className={`whitespace-pre-line leading-snug font-semibold ${isFocusMode ? 'text-5xl md:text-7xl' : 'text-3xl md:text-5xl'}`}
                  style={{
                    color: field.color || "inherit",
                    fontSize: field.fontSize 
                      ? (isFocusMode ? (Number(field.fontSize) * 2) + "px" : `${Number(field.fontSize) * 1.5}px`) 
                      : undefined,
                  }}
                >
                  {correctValue ? (
                    <FormattedFieldValue text={correctValue} />
                  ) : (
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
                  className={`border-border focus-visible:ring-primary rounded-xl ${isFocusMode ? 'text-3xl md:text-5xl h-24' : 'text-2xl md:text-3xl h-16 font-medium'}`}
                  autoComplete="off"
                  data-practice-input="true"
                  onKeyDown={handleInputKeyDown}
                  autoFocus={practiceFieldsOnCard[0]?.id === field.id}
                />
              )}

              {isPractice && revealed && (
                <div className="space-y-2.5">
                  <div
                    className={`rounded-xl border ${isFocusMode ? 'px-6 py-4 text-2xl md:text-3xl' : 'px-4 py-3 text-lg md:text-xl font-medium'} ${
                      normalize(userAnswer) === normalize(correctValue)
                        ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 shadow-xs"
                        : "border-destructive/40 bg-destructive/10 text-destructive shadow-xs"
                    }`}
                  >
                    <span className={`${isFocusMode ? 'text-sm mb-1' : 'text-xs mb-1'} uppercase tracking-widest font-bold block opacity-75`}>
                      {t("vocabulary.yourAnswer") || "Your Answer"}
                    </span>
                    {userAnswer ? (
                      <FormattedFieldValue text={userAnswer} />
                    ) : (
                      <span className="italic opacity-50">({t("vocabulary.emptyFieldValue")})</span>
                    )}
                  </div>
                  {normalize(userAnswer) !== normalize(correctValue) && (
                    <div className={`rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-xs ${isFocusMode ? 'px-6 py-4 text-2xl md:text-3xl' : 'px-4 py-3 text-lg md:text-xl font-medium'}`}>
                      <span className={`${isFocusMode ? 'text-sm mb-1' : 'text-xs mb-1'} uppercase tracking-widest font-bold block opacity-75`}>
                        {t("vocabulary.correctAnswer") || "Correct Answer"}
                      </span>
                      <FormattedFieldValue text={correctValue} />
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
          <Button size="lg" className="w-48 h-11 rounded-xl font-semibold shadow-xs" onClick={onReveal} disabled={!allFilled}>
            {t("vocabulary.showAnswer") || "Show Answer"}
          </Button>
        ) : isLastCard ? (
          <Button size="lg" className="w-48 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs gap-2" onClick={onCheckResult}>
            <CheckCircle2 className="h-5 w-5" />
            {t("vocabulary.checkResult") || "Check Result"}
          </Button>
        ) : (
          <Button size="lg" className="w-48 h-11 rounded-xl font-semibold shadow-xs gap-2" onClick={onNext}>
            {t("vocabulary.next") || "Next"}
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
