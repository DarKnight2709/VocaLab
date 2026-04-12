import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { SocketUser } from '../../common/decorators/socket-user.decorator';
import { MessagesService } from '../messages/services/messages.service';
import { MessageType } from '@prisma/client';
import { WsValidationPipe } from '@/common/pipes/ws-validation.pipe';
import { SendMessageDto } from '../messages/dto/send-message.dto';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },
  namespace: '/',
})
@UseGuards(SocketAuthGuard)
@UseFilters(new WsExceptionFilter())
export class GroupChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    private messagesService: MessagesService,
  ) {}

  @SubscribeMessage('send-group-message')
  @UsePipes(WsValidationPipe)
  async handleSendGroupMessage(
    @SocketUser() user: any,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const { groupId, content, replyTo, attachments } = payload;

      if (!groupId || (!content?.trim() && !attachments)) {
        return { success: false, message: 'Dữ liệu không hợp lệ' };
      }

      const message = await this.messagesService.sendMessage({
        senderId: user.id,
        groupId,
        type: MessageType.GROUP,
        content,
        replyTo,
        attachments,
      });

      // Emit to all group members with FULL sender information
      this.server.to(`group-${groupId}`).emit('receive-group-message', {
        id: message.id,
        senderId: message.senderId,
        sender: message.sender,
        groupId,
        content: message.content,
        status: message.status,
        replyTo,
        attachments: message.attachments,
        seenBy: [],
        createdAt: message.createdAt,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending group message:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('seen-group-message')
  async handleSeenGroupMessage(@SocketUser() user: any, @MessageBody() payload: any) {
    try {
      const { groupId } = payload;
      const userId = user.id;

      if (!groupId) return;

      await this.messagesService.markGroupAsSeen(groupId, userId);

      this.server.to(`group-${groupId}`).emit('seen-group-message', {
        groupId,
        viewerId: userId,
        viewer: {
          id: userId,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        },
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error marking seen:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('update-message-status')
  async handleUpdateMessageStatus(@SocketUser() user: any, @MessageBody() payload: any) {
    try {
      const { messageId, status } = payload;
      const userId = user.id;

      if (!messageId) return;

      await this.messagesService.updateMessageStatus(messageId, status);

      this.server.to(`group-${messageId}`).emit('update-message-status', {
        messageId,
        status,
        user: {
          id: userId,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        },
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error updating message status:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('group-typing-start')
  handleGroupTypingStart(@SocketUser() user: any, @MessageBody() payload: any) {
    const { groupId } = payload;
    if (!groupId) return;

    this.server.to(`group-${groupId}`).emit('group-typing-start', {
      senderId: user.id,
      senderName: user.fullName || user.username,
    });
  }

  @SubscribeMessage('group-typing-stop')
  handleGroupTypingStop(@SocketUser() user: any, @MessageBody() payload: any) {
    const { groupId } = payload;
    if (!groupId) return;

    this.server.to(`group-${groupId}`).emit('group-typing-stop', {
      senderId: user.id,
    });
  }

  @SubscribeMessage('join-group')
  handleJoinGroup(
    @SocketUser() user: any,
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const groupId = typeof payload === 'string' ? payload : payload.groupId;
    if (groupId && client) {
      client.join(`group-${groupId}`);
      console.log(`[Socket] User ${user.id} joined group-${groupId}`);
    }
  }

  @SubscribeMessage('leave-group')
  handleLeavGroup(
    @SocketUser() user: any,
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const groupId = typeof payload === 'string' ? payload : payload.groupId;
    if (groupId && client) {
      client.leave(`group-${groupId}`);
      console.log(`[Socket] User ${user.id} left group-${groupId}`);
    }
  }

  notifyReloadGroups(memberIds: string[], groupId?: string) {
    memberIds.forEach((memberId) => {
      this.server.to(memberId).emit('reload-groups', { groupId });
    });
  }
}

