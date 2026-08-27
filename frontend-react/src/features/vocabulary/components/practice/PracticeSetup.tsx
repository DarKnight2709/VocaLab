import { Eye, EyeOff, PenLine, ArrowRight, ArrowLeftRight, Shuffle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/hooks/useTranslation";
import type { FieldConfig, CardOrderMode } from "../../types";
import type { CardItem } from "../../api/vocabularyService";

interface PracticeSetupProps {
  fieldConfigs: FieldConfig[];
  cards: CardItem[];
  cardOrder: CardOrderMode;
  onCardOrderChange: (order: CardOrderMode) => void;
  onCycleFieldMode: (fieldId: string) => void;
  onStartPractice: () => void;
}

export default function PracticeSetup({
  fieldConfigs,
  cards,
  cardOrder,
  onCardOrderChange,
  onCycleFieldMode,
  onStartPractice,
}: PracticeSetupProps) {
  const { t } = useTranslation();
  const hasPracticeFields = fieldConfigs.some((fc) => fc.mode === "practice");

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4 pb-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("vocabulary.practiceSetup") || "Practice Setup"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Field Configuration List */}
        <div className="lg:col-span-7 space-y-3">
          {fieldConfigs.map((fc) => {
            const isFront = fc.field.side === "FRONT";
            return (
              <div
                key={fc.field.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:px-5 hover:border-primary/40 transition-all duration-200"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-bold text-sm text-foreground truncate">
                    {fc.field.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isFront ? t("vocabulary.fieldsObj.front") : t("vocabulary.fieldsObj.back")}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 min-w-28 h-9 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 ${
                    fc.mode === "practice"
                      ? "border-amber-500/40 text-amber-700 bg-amber-500/10 dark:text-amber-300 hover:bg-amber-500/20 shadow-2xs"
                      : fc.mode === "show"
                        ? "border-sky-500/40 text-sky-700 bg-sky-500/10 dark:text-sky-300 hover:bg-sky-500/20 shadow-2xs"
                        : "border-border/80 text-muted-foreground bg-card hover:bg-muted/60"
                  }`}
                  onClick={() => onCycleFieldMode(fc.field.id)}
                  title="Click to cycle: Show -> Practice -> Hide"
                >
                  {fc.mode === "show" && (
                    <>
                      <Eye className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      {t("vocabulary.practiceFieldShow") || "Show"}
                    </>
                  )}
                  {fc.mode === "practice" && (
                    <>
                      <PenLine className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {t("vocabulary.practiceFieldPractice") || "Practice"}
                    </>
                  )}
                  {fc.mode === "hide" && (
                    <>
                      <EyeOff className="h-3.5 w-3.5 opacity-50" />
                      {t("vocabulary.practiceFieldHide") || "Hide"}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Right Column / Aside: Card Order & Action CTA */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          {/* Card Order Selection */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-foreground">
                  {t("vocabulary.cardOrder") || "Card Order"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("vocabulary.cardOrderDesc") || "Choose how cards will be ordered during practice"}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted/70 text-muted-foreground shrink-0">
                {cards.length} {t("vocabulary.cards", { defaultValue: "cards" })}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onCardOrderChange("order")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  cardOrder === "order"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted/70 text-foreground border-border/70"
                }`}
              >
                <ArrowRight className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("vocabulary.orderSequential") || "In Order"}</span>
              </button>

              <button
                type="button"
                onClick={() => onCardOrderChange("reverse")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  cardOrder === "reverse"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted/70 text-foreground border-border/70"
                }`}
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("vocabulary.orderReverse") || "Reverse"}</span>
              </button>

              <button
                type="button"
                onClick={() => onCardOrderChange("random")}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  cardOrder === "random"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted/70 text-foreground border-border/70"
                }`}
              >
                <Shuffle className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("vocabulary.orderRandom") || "Random"}</span>
              </button>
            </div>
          </div>

          {/* Start Practice CTA Card */}
          <div className="rounded-3xl bg-card border border-border/80 shadow-xs p-5 space-y-2.5">
            <Button
              size="lg"
              className="w-full h-12 font-bold text-base rounded-2xl shadow-xs"
              disabled={!hasPracticeFields || cards.length === 0}
              onClick={onStartPractice}
            >
              {t("vocabulary.startPractice") || "Start Practice"}
            </Button>
            {!hasPracticeFields && (
              <p className="text-xs text-rose-500 font-medium text-center">
                {t("vocabulary.needPracticeField", { defaultValue: "Please select at least 1 field to practice" })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

