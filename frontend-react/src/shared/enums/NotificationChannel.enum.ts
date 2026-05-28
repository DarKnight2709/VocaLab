export const NotificationChannel = {
  EMAIL: "EMAIL",
  INBOX: "INBOX",
  OFF: "OFF",
} as const;

export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];
