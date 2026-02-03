export const MessageType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
