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