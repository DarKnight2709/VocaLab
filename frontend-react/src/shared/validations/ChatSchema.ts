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
  lastMessage: z
    .object({
      isMine: z.boolean().nullable().optional(),
      content: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  canChat: z.boolean().optional(),
});

export const GetUsersResponseSchema = z.object({
  users: z.array(UserItemSchema),
});

export const SearchFriendsResponseSchema = z.object({
  friends: z.array(UserItemSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
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
  content: z.string().nullable().optional(),
  replyTo: z.string().nullable().optional(),
  type: z.nativeEnum(MessageType).optional(),
  attachments: z
    .array(
      z.object({
        url: z.string(),
        type: z.enum(["image", "video", "file", "audio"]),
        name: z.string().optional(),
        size: z.number().optional(),
        mimeType: z.string().optional(),
      }),
    )
    .optional().nullable(),
  createdAt: z.string(),
  seenBy: z.array(PopulatedSenderSchema).optional(),
});

export const GetMessagesResponseSchema = z.object({
  messages: z.array(ChatMessageItemSchema),
});

export const UserChatInfoResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  canChat: z.boolean(),
  isBlocked: z.boolean(),
});

export type UserItem = z.infer<typeof UserItemSchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;
export type ChatMessageItem = z.infer<typeof ChatMessageItemSchema>;
export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;
export type SearchFriendsResponse = z.infer<typeof SearchFriendsResponseSchema>;
export type UserChatInfoResponse = z.infer<typeof UserChatInfoResponseSchema>;
