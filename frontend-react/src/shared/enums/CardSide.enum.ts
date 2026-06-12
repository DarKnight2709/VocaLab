export const CardSide = {
  FRONT: "FRONT",
  BACK: "BACK",
} as const;

export type CardSide = (typeof CardSide)[keyof typeof CardSide];
