import { MessageStatus, MessageType } from '@prisma/client';
import { MessageEntity, UserBasicInfo } from '../message.entity';
import { MessageAttachment } from '../types/message-attachment.type';

export interface MessageWithDetails extends MessageEntity {
  sender: UserBasicInfo;
  receiver?: UserBasicInfo;
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

export const IMESSAGES_REPOSITORY = 'IMESSAGES_REPOSITORY';

export interface MessagesRepositoryInterface {
  create(data: {
    senderId: string;
    receiverId?: string;
    type: MessageType;
    groupId?: string;
    content?: string;
    replyTo?: string;
    attachments?: MessageAttachment[];
  }): Promise<MessageEntity>;

  findDirectMessages(
    userId1: string,
    userId2: string,
  ): Promise<MessageWithDetails[]>;

  findGroupMessages(groupId: string): Promise<MessageWithDetails[]>;

  findLastGroupMessage(groupId: string): Promise<MessageWithDetails | null>;

  countUnreadGroupMessages(
    groupId: string,
    userId: string,
  ): Promise<number>;

  updateMessageStatus(
    messageId: string,
    status: MessageStatus,
  ): Promise<{ message: string}>;

  markDirectMessagesAsSeen(
    senderId: string,
    receiverId: string,
  ): Promise<{ count: number }>;

  markGroupMessagesAsSeen(
    groupId: string,
    userId: string,
  ): Promise<{ count: number }>;

  getConversations(userId: string): Promise<ConversationListItem[]>;

  canChat(senderId: string, receiverId: string): Promise<boolean>;
}
