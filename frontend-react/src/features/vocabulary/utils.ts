import type { CardItem } from "./api/vocabularyService";
import type { CardField } from "@/shared/validations/VocabularySchema";

export function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getUniqueFields(cards: CardItem[]): CardField[] {
  const seen = new Map<string, CardField>();
  for (const card of cards) {
    for (const field of card.cardType?.fields ?? []) {
      if (!seen.has(field.id)) {
        seen.set(field.id, field);
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => {
    if (a.side !== b.side) return a.side === "FRONT" ? -1 : 1;
    return a.order - b.order;
  });
}

export function getFieldValue(card: CardItem, fieldId: string): string {
  const val = (card.values ?? []).find((v) => v.fieldId === fieldId);
  return val?.value ?? "";
}
