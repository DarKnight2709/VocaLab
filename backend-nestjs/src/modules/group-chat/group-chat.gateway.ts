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
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '@/core/database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobNames } from '@/common/enums/email-job-names.enum';
import { SendGroupMessageJobData } from '../notifications/email.processor';

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
    @InjectQueue('email-notification') private emailQueue: Queue,
  ) {}

  @SubscribeMessage('send-group-message')
  @UsePipes(WsValidationPipe)
  async handleSendGroupMessage(
    @SocketUser() user: any,
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

        // 2. Map members to an array of promises for concurrent execution
        const notificationPromises = activeMembers.map(async (member) => {
          try {
            const channel =
              member.user.notificationSettings?.chatMessages ||
              NotificationChannel.INBOX;

            // CHANNEL: INBOX
            if (channel === NotificationChannel.INBOX) {
              const notificationMetadata = {
                replyTo: savedMessage.replyTo,
                attachmentsCount: attachments?.length || 0,
              };

              const memberNotification =
                await this.notificationsService.createChatNotification({
                  type: NotificationType.CHAT_GROUP,
                  senderId: user.id,
                  recipientId: member.userId,
                  groupId,
                  content: savedMessage.content || undefined,
                  metadata: notificationMetadata,
                });

              this.server
                .to(member.userId)
                .emit('receive-notification', memberNotification);
            }

            // CHANNEL: EMAIL
            else if (
              channel === NotificationChannel.EMAIL &&
              member.user.email
            ) {
              await this.emailQueue.add(
                EmailJobNames.SEND_GROUP_MESSAGE_EMAIL,
                {
                  recipientEmail: member.user.email,
                  senderName: user.fullName || user.username,
                  groupName: groupData.name,
                  content: content || '',
                  attachments: attachments || [],
                },
                {
                  attempts: 3,
                  backoff: { type: 'exponential', delay: 1000 },
                  removeOnComplete: true,
                },
              );
            }
          } catch (error) {
            // 3. Catch errors per-user so one failure doesn't break the whole loop
            this.logger.error(
              `Failed to notify user ${member.userId} in group ${groupId}`,
              error,
            );
          }
        });

        // 4. Run all notifications in parallel
        await Promise.all(notificationPromises);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error sending group message:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('seen-group-message')
  async handleSeenGroupMessage(
    @SocketUser() user: any,
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
      console.error('Error marking seen:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('update-message-status')
  async handleUpdateMessageStatus(
    @SocketUser() user: any,
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
