export const CardFieldType = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  IMAGE: "IMAGE",
} as const;

export type CardFieldType = (typeof CardFieldType)[keyof typeof CardFieldType];
