import { z } from "zod";
import { MessageType } from "../enums/MessageType.enum";
import { PopulatedSenderSchema } from "./ChatSchema";
import { MemberRole } from "../enums/MemberRole.enum";
import i18n from "@/shared/i18n";

// Schema cho User (sử dụng chung)
export const MemberUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string().optional().nullable(),
  avatar: z.string().nullable().optional(),
});

// 1. Schema cho Danh sách nhóm (Sidebar/List) - members chỉ là mảng string ID
export const GroupItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  avatar: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  unreadCount: z.number().optional(),
  lastMessage: z
    .object({
      isMine: z.boolean().optional(),
      content: z.string().optional(),
      senderName: z.string().optional(),
      createdAt: z.string().optional(),
    })
    .nullable()
    .optional(),
  updatedAt: z.string().optional(),
  message: z.string().optional(),
});

// 2. Schema cho Thành viên trong nhóm (Detail)
export const GroupMemberSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(MemberRole),
  joinedAt: z.string(),
  user: MemberUserSchema,
  permissions: z.array(z.string()).optional(),
  message: z.string().optional(),
});

// 3. Schema Riêng Biệt cho Thông tin chi tiết Nhóm (Không liên quan đến List)
export const GroupInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  owner: MemberUserSchema.nullable().optional(),
  members: z.array(GroupMemberSchema),
  rolePermissions: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  message: z.string().optional(),
});

export const GetGroupsResponseSchema = z.object({
  groups: z.array(GroupItemSchema),
  message: z.string().optional(),
});

export const GetGroupInfoResponseSchema = z.object({
  message: z.string().optional(),
  group: GroupInfoSchema,
});

export const GetGroupMembersResponseSchema = z.object({
  members: z.array(GroupMemberSchema),
  message: z.string().optional(),
});

// Schema cho tin nhắn nhóm
export const GroupMessageItemSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  sender: PopulatedSenderSchema.optional(),
  groupId: z.string(),
  content: z.string(),
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
    .optional(),
  createdAt: z.string(),
  type: z.literal(MessageType.GROUP),
  seenBy: z.array(PopulatedSenderSchema).optional(),
});

export const GetGroupMessagesResponseSchema = z.object({
  messages: z.array(GroupMessageItemSchema),
  message: z.string().optional(),
});

export const SuccessResponseSchema = z.object({
  message: z.string().optional(),
  success: z.boolean().optional(),
  data: z.any().optional(),
});

// Schema cho việc tạo nhóm
export const getCreateGroupSchema = () =>
  z.object({
    name: z
      .string()
      .min(1, i18n.t("validation.groupNameRequired"))
      .max(50, i18n.t("validation.groupNameMaxLength")),
    description: z.string().max(200, i18n.t("validation.descriptionMaxLength")).optional(),
    members: z.array(z.string()).min(2, i18n.t("validation.selectMinMembers")),
  });

export const UpdateGroupResponseSchema = z.object({
  message: z.string(),
});

export type CreateGroupInput = z.infer<ReturnType<typeof getCreateGroupSchema>>;
export type GroupInfo = z.infer<typeof GroupInfoSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type GroupItem = z.infer<typeof GroupItemSchema>;
export type GetGroupsResponse = z.infer<typeof GetGroupsResponseSchema>;
export type GetGroupInfoResponse = z.infer<typeof GetGroupInfoResponseSchema>;
export type GroupMessageItem = z.infer<typeof GroupMessageItemSchema>;
export type GetGroupMessagesResponse = z.infer<
  typeof GetGroupMessagesResponseSchema
>;
export type GetGroupMembersResponse = z.infer<
  typeof GetGroupMembersResponseSchema
>;
