import { MessageStatus } from '@prisma/client';

export type AttachmentType = 'image' | 'video' | 'file' | 'audio';

export interface MessageAttachment {
  url: string;
  type: AttachmentType;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface UserBasicInfo {
  id: string;
  username: string;
  fullName?: string | null;
  avatar?: string | null;
  canChat?: boolean;
}

export interface MessageWithDetails {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
  status?: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  sender: UserBasicInfo;
  receiver?: UserBasicInfo;
  seenBy: UserBasicInfo[];
}

export interface ConversationListItem extends UserBasicInfo {
  lastMessage: {
    content?: string;
    createdAt: Date;
    isMine: boolean;
  } | null;
  unreadCount: number;
  canChat?: boolean;
}
