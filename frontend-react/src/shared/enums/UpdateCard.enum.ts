export const UpdateCard = {
  NEWER: "NEWER",
  ALWAYS: "ALWAYS",
  NEVER: "NEVER",
} as const;

export type UpdateCard = (typeof UpdateCard)[keyof typeof UpdateCard];