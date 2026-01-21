
import { z } from "zod";
import type { MessageItem, UserItem } from "./ChatSchema";

// Group messages and members response types
export type GetGroupMessagesResponse = { messages: MessageItem[] };
export type GetGroupMembersResponse = { members: UserItem[] };

// Group schema with UI-specific fields
export const GroupItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  avatar: z.string().optional(),
  description: z.string().optional(),
  unreadCount: z.number().optional(),
  lastMessage: z.object({
    isMine: z.boolean().optional(),
    content: z.string().optional(),
    senderName: z.string().optional(),
    createdAt: z.string().optional(),
  }).optional(),
});

export const GetGroupsResponseSchema = z.object({
  groups: z.array(GroupItemSchema),
});

export const GetGroupInfoResponseSchema = z.object({
  group: GroupItemSchema,
});

export type GroupItem = z.infer<typeof GroupItemSchema>;
export type GetGroupsResponse = z.infer<typeof GetGroupsResponseSchema>;
export type GetGroupInfoResponse = z.infer<typeof GetGroupInfoResponseSchema>;
