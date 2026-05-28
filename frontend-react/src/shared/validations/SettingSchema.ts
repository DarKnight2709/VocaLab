import { z } from "zod";
import { NotificationType } from "../enums/NotificationType.enum";

export const NotificationChannelEnum = z.nativeEnum(NotificationType);

export const NotificationSettingSchema = z.object({
  chatMessages: NotificationChannelEnum,
  commentsOnPosts: NotificationChannelEnum,
  upvotes: NotificationChannelEnum,
  repliesToComments: NotificationChannelEnum,
  newFollowers: NotificationChannelEnum,
  activityFromFollowed: NotificationChannelEnum,
  updatedAt: z.string(),
});


export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;