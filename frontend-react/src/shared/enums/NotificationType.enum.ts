export const NotificationType = {
  CHAT_DIRECT: "CHAT_DIRECT",
  CHAT_GROUP: "CHAT_GROUP",
  SYSTEM: "SYSTEM",
  COMMENT: "COMMENT",
  UPVOTE: "UPVOTE",
  FOLLOW: "FOLLOW",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
