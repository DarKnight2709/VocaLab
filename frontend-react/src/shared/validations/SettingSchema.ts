import { z } from "zod";
import { NotificationChannel } from "../enums/NotificationChannel.enum";

export const NotificationChannelEnum = z.nativeEnum(NotificationChannel);

export const NotificationSettingSchema = z.object({
  chatMessages: NotificationChannelEnum,
  comments: NotificationChannelEnum,
  upvotes: NotificationChannelEnum,
  newFollowers: NotificationChannelEnum,
  activityFromFollowed: NotificationChannelEnum,
  updatedAt: z.string(),
});

export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;

// Reminder
export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: z.string(),
  isEnabled: z.boolean(),
  triggerTime: z.number().nullable(),
  startTime: z.number().nullable(),
  endTime: z.number().nullable(),
  daysOfWeek: z.array(z.number()),
  createdAt: z.string(),
});

export const ReminderDeleteResponseSchema = z.object({
  id: z.string(),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const ReminderListResponseSchema = z.object({
  reminders: z.array(ReminderSchema),
  meta: PaginationMetaSchema,
});
export const ReminderResponseSchema = ReminderSchema;

export type Reminder = z.infer<typeof ReminderSchema>;
export type ReminderListResponse = z.infer<typeof ReminderListResponseSchema>;
