import { z } from "zod";
import { NotificationType } from "../enums/NotificationType.enum";

export const NotificationSenderSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  avatar: z.string().nullable().optional(),
});

export const UnreadCountResponseSchema = z.number();

export const NotificationItemSchema = z.object({
  id: z.string(),
  recipientId: z.string().nullable().optional(),
  senderId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  groupName: z.string().nullable().optional(),
  type: z.nativeEnum(NotificationType),
  content: z.string().nullable().optional(),
  isRead: z.boolean(),
  metadata: z.any().nullable().optional(),
  createdAt: z.string(),
  sender: NotificationSenderSchema.nullable().optional(),
});

export const NotificationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  lastPage: z.number(),
});

export const GetNotificationResponseSchema = z.object({
  notifications: z.array(NotificationItemSchema),
  meta: NotificationMetaSchema,
});

export type GetNotificationResponse = z.infer<typeof GetNotificationResponseSchema>;
export type NotificationSender = z.infer<typeof NotificationSenderSchema>;
export type NotificationItem = z.infer<typeof NotificationItemSchema>;
export type NotificationMeta = z.infer<typeof NotificationMetaSchema>;
