import type { RequestUser } from '@/common/types';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  UseGuards,
  UsePipes,
  UseFilters,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { SocketUser } from '../../common/decorators/socket-user.decorator';
import { MessagesService } from '../messages/messages.service';
import {
  MessageType,
  NotificationChannel,
  NotificationType,
} from '@prisma/client';
import { WsValidationPipe } from '@/common/pipes/ws-validation.pipe';
import { SendGroupMessageDto } from '../messages/dto/messages.dto';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PrismaService } from '@/core/database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobNames } from '@/common/enums/email-job-names.enum';
import { NotificationsService } from '../notifications/services/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
    ],
    credentials: true,
  },
  namespace: '/',
})
@UseGuards(SocketAuthGuard)
@UseFilters(new WsExceptionFilter())
export class GroupChatGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GroupChatGateway.name);

  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    @InjectQueue('email-notification') private emailQueue: Queue,
  ) {}

  @SubscribeMessage('send-group-message')
  @UsePipes(WsValidationPipe)
  async handleSendGroupMessage(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: SendGroupMessageDto,
  ) {
    try {
      const { groupId, content, replyTo, attachments } = payload;

      const savedMessage = await this.messagesService.sendMessage({
        senderId: user.id,
        groupId,
        type: MessageType.GROUP,
        content,
        replyTo,
        attachments,
      });

      // Emit to all group members with FULL sender information
      this.server.to(`group-${groupId}`).emit('receive-group-message', {
        ...savedMessage,
        attachments,
        groupId,
        seenBy: [],
      });

      // 1. Get all members of the group and group info
      const groupData = await this.prisma.group.findUnique({
        where: { id: groupId },
        select: {
          name: true,
          members: {
            select: {
              userId: true,
              user: {
                select: {
                  email: true,
                  notificationSettings: {
                    select: {
                      chatMessages: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (groupData && groupData.members.length > 0) {
        // 1. Filter out the sender immediately to reduce array size
        const activeMembers = groupData.members.filter(
          (member) => member.userId !== user.id,
        );

        const inboxMembers = activeMembers.filter(
          (m) =>
            (m.user.notificationSettings?.chatMessages ??
              NotificationChannel.INBOX) === NotificationChannel.INBOX,
        );

        const emailMembers = activeMembers.filter(
          (m) =>
            m.user.notificationSettings?.chatMessages ===
              NotificationChannel.EMAIL && !!m.user.email,
        );

        // 2. Create 1 single group notification in the database (replaces N duplicate rows)
        if (inboxMembers.length > 0) {
          const notificationMetadata = {
            replyTo: savedMessage.replyTo,
            attachmentsCount: attachments?.length || 0,
          };

          const groupNotification =
            await this.notificationsService.createNotification({
              type: NotificationType.CHAT_GROUP,
              senderId: user.id,
              groupId,
              content: savedMessage.content || undefined,
              metadata: notificationMetadata,
            });

          // Deliver real-time WebSocket notification to all inbox members
          for (const member of inboxMembers) {
            this.notificationsGateway.sendNotificationToUser(
              member.userId,
              groupNotification,
            );
          }
        }

        // 3. Batch enqueue emails in 1 Redis operation
        if (emailMembers.length > 0) {
          await this.emailQueue.addBulk(
            emailMembers.map((member) => ({
              name: EmailJobNames.SEND_GROUP_MESSAGE_EMAIL,
              data: {
                recipientEmail: member.user.email!,
                senderName: user.fullName || user.username,
                groupName: groupData.name,
                content: content || '',
                attachments: attachments || [],
              },
              opts: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
              },
            })),
          );
        }
      }

      return { success: true };
    } catch (error: any) {
      this.logger.error('Error sending group message', error?.message ?? error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('seen-group-message')
  async handleSeenGroupMessage(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: any,
  ) {
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
      this.logger.error('Error marking seen', error?.message ?? error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('update-message-status')
  async handleUpdateMessageStatus(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: any,
  ) {
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
      this.logger.error('Error updating message status', error?.message ?? error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('group-typing-start')
  handleGroupTypingStart(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { groupId } = payload;
    if (!groupId) return;

    this.server.to(`group-${groupId}`).emit('group-typing-start', {
      senderId: user.id,
      senderName: user.fullName || user.username,
    });
  }

  @SubscribeMessage('group-typing-stop')
  handleGroupTypingStop(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { groupId } = payload;
    if (!groupId) return;

    this.server.to(`group-${groupId}`).emit('group-typing-stop', {
      senderId: user.id,
    });
  }

  @SubscribeMessage('join-group')
  handleJoinGroup(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const groupId = typeof payload === 'string' ? payload : payload.groupId;
    if (groupId && client) {
      client.join(`group-${groupId}`);
      this.logger.log(`User ${user.id} joined group-${groupId}`);
    }
  }

  @SubscribeMessage('leave-group')
  handleLeavGroup(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const groupId = typeof payload === 'string' ? payload : payload.groupId;
    if (groupId && client) {
      client.leave(`group-${groupId}`);
      this.logger.log(`User ${user.id} left group-${groupId}`);
    }
  }

  notifyReloadGroups(memberIds: string[], groupId?: string) {
    memberIds.forEach((memberId) => {
      this.server.to(memberId).emit('reload-groups', { groupId });
    });
  }
}
