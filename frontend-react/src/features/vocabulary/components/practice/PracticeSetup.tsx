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
    <div className="max-w-xl mx-auto space-y-8 mt-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">{t("vocabulary.practiceSetup") || "Practice Setup"}</h2>
        <p className="text-sm text-muted-foreground">
          {t("vocabulary.selectFieldsDesc") || "Choose which fields to practice (type answers), show (visible), or hide."}
        </p>
      </div>

      {/* Card Order Selection */}
      <div className="space-y-3 rounded-2xl bg-card border border-border/50 shadow-sm p-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">
            {t("vocabulary.cardOrder") || "Card Order"}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {t("vocabulary.cardOrderDesc") || "Choose how cards will be ordered during practice"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <Button
            type="button"
            variant="outline"
            className={`flex flex-col md:flex-row items-center justify-center gap-2 h-14 md:h-11 font-semibold text-xs md:text-sm rounded-xl transition-all ${
              cardOrder === "order"
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border/60 hover:bg-muted/40 text-muted-foreground"
            }`}
            onClick={() => onCardOrderChange("order")}
          >
            <ArrowRight className="h-4 w-4 shrink-0" />
            <span>{t("vocabulary.orderSequential") || "In Order"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={`flex flex-col md:flex-row items-center justify-center gap-2 h-14 md:h-11 font-semibold text-xs md:text-sm rounded-xl transition-all ${
              cardOrder === "reverse"
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border/60 hover:bg-muted/40 text-muted-foreground"
            }`}
            onClick={() => onCardOrderChange("reverse")}
          >
            <ArrowLeftRight className="h-4 w-4 shrink-0" />
            <span>{t("vocabulary.orderReverse") || "Reverse"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={`flex flex-col md:flex-row items-center justify-center gap-2 h-14 md:h-11 font-semibold text-xs md:text-sm rounded-xl transition-all ${
              cardOrder === "random"
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border/60 hover:bg-muted/40 text-muted-foreground"
            }`}
            onClick={() => onCardOrderChange("random")}
          >
            <Shuffle className="h-4 w-4 shrink-0" />
            <span>{t("vocabulary.orderRandom") || "Random"}</span>
          </Button>
        </div>
      </div>

      {/* Field Configuration List */}
      <div className="space-y-3">
        {fieldConfigs.map((fc) => {
          return (
            <div
              key={fc.field.id}
              className="flex items-center justify-between rounded-2xl bg-card border border-border/50 shadow-sm px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{fc.field.label}</span>
                <span className="text-[13px] text-muted-foreground">
                  {fc.field.side === "FRONT" ? t("vocabulary.frontFace") : t("vocabulary.backFace")}
                </span>
              </div>
              <Button
                variant="outline"
                className={`gap-1.5 min-w-[110px] h-9 justify-center font-semibold text-[13px] rounded-xl ${
                  fc.mode === "practice"
                    ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20"
                    : fc.mode === "show"
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
                onClick={() => onCycleFieldMode(fc.field.id)}
              >
                {fc.mode === "show" && (
                  <>
                    <Eye className="h-4 w-4" />
                    {t("vocabulary.practiceFieldShow") || "Show"}
                  </>
                )}
                {fc.mode === "practice" && (
                  <>
                    <PenLine className="h-4 w-4" />
                    {t("vocabulary.practiceFieldPractice") || "Practice"}
                  </>
                )}
                {fc.mode === "hide" && (
                  <>
                    <EyeOff className="h-4 w-4" />
                    {t("vocabulary.practiceFieldHide") || "Hide"}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          className="w-56 h-11 font-bold text-[15px] rounded-xl"
          disabled={!hasPracticeFields || cards.length === 0}
          onClick={onStartPractice}
        >
          {t("vocabulary.startPractice") || "Start Practice"}
        </Button>
      </div>
    </div>
  );
}

