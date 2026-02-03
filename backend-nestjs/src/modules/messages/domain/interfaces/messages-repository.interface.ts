
import { MessageType } from '@prisma/client';
import { MessageEntity } from '../message.entity';
import { MessageAttachment } from '../types/message-attachment.type';

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
  ): Promise<any[]>;

  findGroupMessages(groupId: string): Promise<any[]>;

  findLastGroupMessage(groupId: string): Promise<any | null>;

  countUnreadGroupMessages(
    groupId: string,
    userId: string,
  ): Promise<number>;

  markDirectMessagesAsSeen(
    senderId: string,
    receiverId: string,
  ): Promise<{ count: number }>;

  markGroupMessagesAsSeen(
    groupId: string,
    userId: string,
  ): Promise<{ count: number }>;

  getConversations(userId: string): Promise<any[]>;
}
