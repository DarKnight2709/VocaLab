export const SrsRating = {
  AGAIN: "AGAIN",
  HARD: "HARD",
  GOOD: "GOOD",
  EASY: "EASY",
} as const;

export type SrsRating = (typeof SrsRating)[keyof typeof SrsRating];
