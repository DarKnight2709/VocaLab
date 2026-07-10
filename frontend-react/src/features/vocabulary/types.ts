import type { CardItem } from "./api/vocabularyService";
import type { CardField } from "@/shared/validations/VocabularySchema";

export type FieldMode = "show" | "practice" | "hide";

export interface FieldConfig {
  field: CardField;
  mode: FieldMode;
}

export interface PracticeResult {
  card: CardItem;
  fieldResults: {
    fieldId: string;
    correct: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  allCorrect: boolean;
}
