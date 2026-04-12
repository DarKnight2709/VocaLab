import { MessageStatus, MessageType } from "@prisma/client";
import { MessageAttachment } from "./types/message-attachment.type";

export interface UserBasicInfo {
  id: string;
  username: string;
  fullName?: string | null;
  avatar?: string | null;
}

export class MessageEntity {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
  status?: MessageStatus;
  sender?: {
    id: string;
    username: string;
    fullName?: string | null;
    avatar?: string | null;
  };
  seenBy: UserBasicInfo[];
  createdAt: Date;
  updatedAt: Date;
  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }

  static validateMessageContent(
    content?: string,
    attachments?: MessageAttachment[],
  ): boolean {
    return !!(content?.trim() || attachments &&attachments?.length > 0);
  }

  static canSendMessage(
    senderId: string,
    receiverId?: string,
    groupId?: string,
  ): boolean {
    // Must have either receiverId (direct) or groupId (group)
    return !!(receiverId || groupId);
  }

  static isDirectMessage(type: MessageType): boolean {
    return type === MessageType.DIRECT;
  }

  static isGroupMessage(type: MessageType): boolean {
    return type === MessageType.GROUP;
  }

}
