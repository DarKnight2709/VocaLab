import { useState, useMemo, useCallback, useEffect } from "react";
import type { CardItem } from "../api/vocabularyService";
import type { CardField } from "@/shared/validations/VocabularySchema";
import { CardFieldType } from "@/shared/enums/CardFieldType.enum";

import PracticeSetup from "./practice/PracticeSetup";
import PracticeCard from "./practice/PracticeCard";
import PracticeResults from "./practice/PracticeResults";
import { getUniqueFields, getFieldValue, normalize } from "../utils";
import type { FieldConfig, FieldMode } from "../types";

interface PracticeModeProps {
  cards: CardItem[];
  onFinish?: () => void;
}

type Phase = "setup" | "practicing" | "results";

export default function PracticeMode({ cards, onFinish }: PracticeModeProps) {
  // Phase 1: Setup state
  const uniqueFields = useMemo(() => getUniqueFields(cards), [cards]);

  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(() =>
    uniqueFields.map((field) => ({
      field,
      mode: "show",
    }))
  );

  // Phase 2: Practice state
  const [phase, setPhase] = useState<Phase>("setup");
  const [practiceCards, setPracticeCards] = useState<CardItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({});
  const [revealed, setRevealed] = useState(false);

  // ─── Derived data ─────────────────────────────────────

  const practiceFieldIds = useMemo(
    () => new Set(fieldConfigs.filter((fc) => fc.mode === "practice").map((fc) => fc.field.id)),
    [fieldConfigs]
  );

  const showFieldIds = useMemo(
    () => new Set(fieldConfigs.filter((fc) => fc.mode === "show").map((fc) => fc.field.id)),
    [fieldConfigs]
  );

  const currentCard = practiceCards[currentIdx] ?? null;
  const isLastCard = currentIdx === practiceCards.length - 1;

  // ─── Handlers ─────────────────────────────────────────

  const cycleFieldMode = useCallback((fieldId: string) => {
    setFieldConfigs((prev) =>
      prev.map((fc) => {
        if (fc.field.id !== fieldId) return fc;
        const isImage = fc.field.fieldType === CardFieldType.IMAGE;
        const order: FieldMode[] = isImage ? ["show", "hide"] : ["show", "practice", "hide"];
        const nextIdx = (order.indexOf(fc.mode) + 1) % order.length;
        return { ...fc, mode: order[nextIdx] };
      })
    );
  }, []);

  const handleStartPractice = useCallback(() => {
    setPracticeCards([...cards]);
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("practicing");
  }, [cards]);

  const handleAnswerChange = useCallback(
    (cardId: string, fieldId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [cardId]: { ...prev[cardId], [fieldId]: value },
      }));
    },
    []
  );

  const handleReveal = useCallback(() => setRevealed(true), []);

  const handleNext = useCallback(() => {
    setRevealed(false);
    setCurrentIdx((i) => i + 1);
  }, []);

  const handleCheckResult = useCallback(() => {
    setPhase("results");
  }, []);

  // Handle Enter key to move to next card or check results
  useEffect(() => {
    if (phase !== "practicing") return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent holding down Enter from skipping
      if (e.key === "Enter" && revealed) {
        e.preventDefault();
        e.stopPropagation();
        if (isLastCard) handleCheckResult();
        else handleNext();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [phase, revealed, isLastCard, handleNext, handleCheckResult]);

  // ─── Results computation ──────────────────────────────

  const results = useMemo(() => {
    return practiceCards.map((card) => {
      const fieldResults = Array.from(practiceFieldIds).map((fieldId) => {
        const correct = getFieldValue(card, fieldId);
        const userAnswer = answers[card.id]?.[fieldId] ?? "";
        const isCorrect = normalize(userAnswer) === normalize(correct);
        return { fieldId, correct, userAnswer, isCorrect };
      });
      const allCorrect = fieldResults.every((fr) => fr.isCorrect);
      return { card, fieldResults, allCorrect };
    });
  }, [practiceCards, practiceFieldIds, answers]);

  const correctCount = results.filter((r) => r.allCorrect).length;

  const handleTryAgain = useCallback(() => {
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("practicing");
  }, []);

  const handleTryWrongOnes = useCallback(() => {
    const wrongCards = results.filter((r) => !r.allCorrect).map((r) => r.card);
    if (wrongCards.length === 0) return;
    setPracticeCards(wrongCards);
    setCurrentIdx(0);
    setAnswers({});
    setRevealed(false);
    setPhase("practicing");
  }, [results]);

  // ─── Field label helper ───────────────────────────────

  const fieldMap = useMemo(() => {
    const m = new Map<string, CardField>();
    for (const fc of fieldConfigs) m.set(fc.field.id, fc.field);
    return m;
  }, [fieldConfigs]);

  // ═════════════════════════════════════════════════════════
  //  RENDER
  // ═════════════════════════════════════════════════════════

  if (phase === "setup") {
    return (
      <PracticeSetup
        fieldConfigs={fieldConfigs}
        cards={cards}
        onCycleFieldMode={cycleFieldMode}
        onStartPractice={handleStartPractice}
      />
    );
  }

  if (phase === "practicing" && currentCard) {
    return (
      <PracticeCard
        currentCard={currentCard}
        currentIdx={currentIdx}
        totalCards={practiceCards.length}
        practiceFieldIds={practiceFieldIds}
        showFieldIds={showFieldIds}
        answers={answers}
        revealed={revealed}
        isLastCard={isLastCard}
        onAnswerChange={handleAnswerChange}
        onReveal={handleReveal}
        onNext={handleNext}
        onCheckResult={handleCheckResult}
      />
    );
  }

  if (phase === "results") {
    return (
      <PracticeResults
        practiceCards={practiceCards}
        correctCount={correctCount}
        results={results}
        showFieldIds={showFieldIds}
        fieldMap={fieldMap}
        onTryAgain={handleTryAgain}
        onTryWrongOnes={handleTryWrongOnes}
        onSetup={() => setPhase("setup")}
        onFinish={onFinish}
      />
    );
  }

  return null;
}
