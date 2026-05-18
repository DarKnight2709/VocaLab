import { Injectable, BadRequestException, Inject } from '@nestjs/common';

import { MessageEntity } from '../domain/message.entity';
import {
  IMESSAGES_REPOSITORY,
  type MessagesRepositoryInterface,
  MessageWithDetails,
  ConversationListItem,
} from '../domain/interfaces/messages-repository.interface';
import { MessageStatus, MessageType } from '@prisma/client';
import {
  AttachmentType,
  MessageAttachment,
} from '../domain/types/message-attachment.type';
import { ErrorCode } from '@/common/enums/error-code.enum';

export interface SendMessageInput {
  senderId: string;
  receiverId?: string;
  type: MessageType;
  groupId?: string;
  content?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
}

@Injectable()
export class MessagesService {
  constructor(
    @Inject(IMESSAGES_REPOSITORY)
    private readonly messageRepository: MessagesRepositoryInterface,
  ) {}

  async getConversations(
    userId: string,
  ): Promise<{ users: ConversationListItem[] }> {
    const users = await this.messageRepository.getConversations(userId);
    return { users };
  }

  async getMessages(
    userId: string,
    friendId: string,
  ): Promise<{ messages: MessageWithDetails[] }> {
    const messages = await this.messageRepository.findDirectMessages(
      userId,
      friendId,
    );
    return { messages };
  }

  async sendMessage(input: SendMessageInput) {
    const isDirectMessage = MessageEntity.isDirectMessage(input.type);

    if (isDirectMessage) {
      if (!input.receiverId) {
        throw new BadRequestException(ErrorCode.RECEIVER_ID_REQUIRED);
      }
      const allowed = await this.messageRepository.canChat(input.senderId, input.receiverId);
      if (!allowed) {
        throw new BadRequestException(ErrorCode.CANNOT_CHAT_WITH_USER);
      }
    } else {
      if (!input.groupId) {
        throw new BadRequestException(ErrorCode.GROUP_ID_REQUIRED);
      }
    }
    // Validate
    if (
      !MessageEntity.validateMessageContent(input.content, input.attachments)
    ) {
      throw new BadRequestException(
        ErrorCode.MESSAGE_CONTENT_OR_ATTACHMENTS_REQUIRED,
      );
    }

    if (
      !MessageEntity.canSendMessage(
        input.senderId,
        input.receiverId,
        input.groupId,
      )
    ) {
      throw new BadRequestException(ErrorCode.MESSAGE_TARGET_REQUIRED);
    }

    // Create message
    return this.messageRepository.create({
      senderId: input.senderId,
      receiverId: input.receiverId,
      type: input.type,
      groupId: input.groupId,
      content: input.content?.trim(),
      replyTo: input.replyTo,
      attachments: input.attachments,
    });
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    return this.messageRepository.updateMessageStatus(messageId, status);
  }

  async markAsSeen(senderId: string, receiverId: string) {
    return this.messageRepository.markDirectMessagesAsSeen(
      senderId,
      receiverId,
    );
  }

  async markGroupAsSeen(groupId: string, userId: string) {
    return this.messageRepository.markGroupMessagesAsSeen(groupId, userId);
  }
}
