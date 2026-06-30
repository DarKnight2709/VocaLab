export const UpdateCardType = {
  NEWER: 'NEWER',
  ALWAYS: 'ALWAYS',
  NEVER: 'NEVER',
} as const;

export type UpdateCardType = (typeof UpdateCardType)[keyof typeof UpdateCardType];

