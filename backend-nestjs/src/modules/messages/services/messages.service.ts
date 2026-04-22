import { Injectable, BadRequestException, Inject } from '@nestjs/common';

import { MessageEntity } from '../domain/message.entity';
import { IMESSAGES_REPOSITORY, type MessagesRepositoryInterface, MessageWithDetails, ConversationListItem } from '../domain/interfaces/messages-repository.interface';
import { MessageStatus, MessageType } from '@prisma/client';
import { AttachmentType, MessageAttachment } from '../domain/types/message-attachment.type';

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

  async getConversations(userId: string): Promise<{ users: ConversationListItem[] }> {
    const users = await this.messageRepository.getConversations(userId);
    return { users };
  }

  async getMessages(userId: string, friendId: string): Promise<{ messages: MessageWithDetails[] }> {
    const messages = await this.messageRepository.findDirectMessages(userId, friendId);
    return { messages };
  }

  async sendMessage(input: SendMessageInput) {

    const isDirectMessage = MessageEntity.isDirectMessage(input.type)

    if(isDirectMessage){
      if(!input.receiverId){
        throw new BadRequestException('Message must have receiverId');
      }
    } else {
      if(!input.groupId){
        throw new BadRequestException('Message must have groupId');
      }
    }
    // Validate
    if (!MessageEntity.validateMessageContent(input.content, input.attachments)) {
      throw new BadRequestException('Message must have content or attachments');
    }

    if (!MessageEntity.canSendMessage(input.senderId, input.receiverId, input.groupId)) {
      throw new BadRequestException('Message must have receiverId or groupId');
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
    return this.messageRepository.markDirectMessagesAsSeen(senderId, receiverId);
  }

  async markGroupAsSeen(groupId: string, userId: string) {
    return this.messageRepository.markGroupMessagesAsSeen(groupId, userId);
  }
}
