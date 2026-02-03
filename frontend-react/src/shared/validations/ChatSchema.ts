import { z } from "zod";

// User schema with UI-specific fields
export const UserItemSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional(),
  avatar: z.string().optional(),
  email: z.string().optional(),
  unreadCount: z.number().optional(),
  lastMessage: z.object({
    isMine: z.boolean().optional(),
    content: z.string().optional(),
  }).optional(),
});

export const GetUsersResponseSchema = z.object({
  users: z.array(UserItemSchema),
});

// Populated sender object schema
const PopulatedSenderSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  fullName: z.string().optional(),
  avatar: z.string().optional(),
});

// Message schema with flexible senderId (string or populated object)
export const MessageItemSchema = z.object({
  id: z.string(),
  senderId: z.union([z.string(), PopulatedSenderSchema]),
  sender: PopulatedSenderSchema.optional(), // ✅ Separate sender object from backend
  content: z.string(),
  createdAt: z.string(),
  seenBy: z.array(z.union([z.string(), PopulatedSenderSchema])).optional(),
});

export const GetMessagesResponseSchema = z.object({
  messages: z.array(MessageItemSchema),
});

export type UserItem = z.infer<typeof UserItemSchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type MessageItem = z.infer<typeof MessageItemSchema>;
export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;