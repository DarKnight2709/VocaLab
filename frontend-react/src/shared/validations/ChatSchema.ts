import { z } from "zod";
import { MessageType } from "../enums/MessageType.enum";

// User schema with UI-specific fields
export const UserItemSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional(),
  avatar: z.string().nullable().optional(),
  email: z.string().optional(),
  unreadCount: z.number().optional(),
  lastMessage: z.object({
    isMine: z.boolean().nullable().optional(),
    content: z.string().nullable().optional(),
  }).nullable().optional(),
});

export const GetUsersResponseSchema = z.object({
  users: z.array(UserItemSchema),
});

// Populated sender object schema
export const PopulatedSenderSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  fullName: z.string().optional(),
  avatar: z.string().nullable().optional(),
});

// Message schema with flexible senderId (string or populated object)
export const ChatMessageItemSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  sender: PopulatedSenderSchema.optional(), 
  receiverId: z.string().optional(),
  content: z.string(),
  createdAt: z.string(),
  type: z.literal(MessageType.DIRECT),
  seenBy: z.array(PopulatedSenderSchema).optional(),
});

export const GetMessagesResponseSchema = z.object({
  messages: z.array(ChatMessageItemSchema),
});

export type UserItem = z.infer<typeof UserItemSchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type ChatMessageItem = z.infer<typeof ChatMessageItemSchema>;
export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;