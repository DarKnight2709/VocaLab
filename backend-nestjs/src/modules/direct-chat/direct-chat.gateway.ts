import type { RequestUser } from '@/common/types';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { SocketUser } from '../../common/decorators/socket-user.decorator';
import { MessagesService } from '../messages/messages.service';
import { MessageType, NotificationType, NotificationChannel } from '@prisma/client';
import { WsValidationPipe } from '@/common/pipes/ws-validation.pipe';
import { SendDirectMessageDto } from '../messages/dto/messages.dto';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobNames } from '@/common/enums/email-job-names.enum';
import { PrismaService } from '@/core/database/prisma.service';
import { NotificationsService } from '../notifications/services/notifications.service';
import { RedisService } from '@/core/cache/redis.service';

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
export class DirectChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly ONLINE_USERS_KEY = 'direct_chat_online_users';

  private async getOnlineUsersMap(): Promise<Record<string, string[]>> {
    const data = await this.redisService.getCache<Record<string, string[]>>(this.ONLINE_USERS_KEY);
    return data || {};
  }

  private async saveOnlineUsersMap(map: Record<string, string[]>): Promise<void> {
    await this.redisService.setCache(this.ONLINE_USERS_KEY, map);
  }

  constructor(
    private messagesService: MessagesService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    private prisma: PrismaService,
    private redisService: RedisService,
    @InjectQueue('email-notification') private readonly emailQueue: Queue,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[Socket] New connection: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const user = (client as any).user;
    const socketId = client.id;

    if (!user) return;

    const userId = user.id;
    const onlineMap = await this.getOnlineUsersMap();
    let socketArray = onlineMap[userId];

    if (socketArray) {
      socketArray = socketArray.filter((id) => id !== socketId);
      if (socketArray.length === 0) {
        delete onlineMap[userId];
        this.server.emit('noti-offline', { id: userId });
      } else {
        onlineMap[userId] = socketArray;
      }
      await this.saveOnlineUsersMap(onlineMap);
    }
  }

  @SubscribeMessage('entering')
  async handleEntering(@SocketUser() user: RequestUser, @ConnectedSocket() client: Socket) {
    if (!user) return;

    const userId = user.id;
    const socketId = client.id;
    client.join(userId);

    const onlineMap = await this.getOnlineUsersMap();
    let socketArray = onlineMap[userId];

    if (!socketArray) {
      socketArray = [];
      onlineMap[userId] = socketArray;
    }

    if (!socketArray.includes(socketId)) {
      socketArray.push(socketId);
      if (socketArray.length === 1) {
        this.server.emit('noti-online', { id: userId });
      }
      await this.saveOnlineUsersMap(onlineMap);
    }

    client.emit('noti-onlineList-toMe', Object.keys(onlineMap));
  }

  @SubscribeMessage('send-message')
  @UsePipes(WsValidationPipe)
  async handleSendMessage(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: SendDirectMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { content, receiverId, replyTo, attachments } = payload;

      const savedMessage = await this.messagesService.sendMessage({
        senderId: user.id,
        receiverId,
        type: MessageType.DIRECT,
        content,
        replyTo,
        attachments,
      });

      this.server.to(receiverId).emit('receive-message', {
        ...savedMessage,
        attachments,
        receiverId,
        seenBy: [],
      });

      // 1. Fetch receiver's notification settings
      const recipientData = await this.prisma.user.findUnique({
        where: { id: receiverId },
        select: {
          email: true,
          notificationSettings: {
            select: {
              chatMessages: true,
            },
          },
        },
      });

      const channel =
        recipientData?.notificationSettings?.chatMessages ||
        NotificationChannel.INBOX;

      if (channel === NotificationChannel.INBOX) {
        // Option 1: INBOX
        const notificationMetadata = {
          replyTo: savedMessage.replyTo,
          attachmentsCount: attachments?.length || 0,
        };

        const savedNotification =
          await this.notificationsService.createNotification({
            type: NotificationType.CHAT_DIRECT,
            senderId: user.id,
            recipientId: receiverId,
            content: savedMessage.content || undefined,
            metadata: notificationMetadata,
          });

        this.notificationsGateway.sendNotificationToUser(
          receiverId,
          savedNotification,
        );
      } else if (channel === NotificationChannel.EMAIL) {
        // Option 2: EMAIL
        if (recipientData?.email) {
          await this.emailQueue.add(
            EmailJobNames.SEND_DIRECT_MESSAGE_EMAIL,
            {
              recipientEmail: recipientData.email,
              senderName: user.fullName || user.username,
              content: savedMessage.content,
              attachments,
            },
            {
              attempts: 3,
              backoff: { type: 'exponential', delay: 1000 },
              removeOnComplete: true,
            },
          );
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Send message error:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('seen-message')
  async handleSeenMessage(
    @SocketUser() user: RequestUser,
    @MessageBody() payload: any,
  ) {
    try {
      const { senderId } = payload;
      const viewerId = user.id;

      if (!senderId) return;

      const result = await this.messagesService.markAsSeen(senderId, viewerId);

      if (result.count > 0) {
        this.server.to(senderId).emit('seen-message', {
          viewer: user,
        });
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error marking seen:', error);
      return { success: false, message: error.message };
    }
  }

  @SubscribeMessage('typing-start')
  handleTypingStart(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId } = payload;
    if (!receiverId) return;

    this.server.to(receiverId).emit('typing-start', {
      senderId: user.id,
      senderName: user.fullName || user.username,
    });
  }

  @SubscribeMessage('typing-stop')
  handleTypingStop(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId } = payload;
    if (!receiverId) return;

    this.server.to(receiverId).emit('typing-stop', {
      senderId: user.id,
    });
  }

  @SubscribeMessage('call-user')
  async handleCallUser(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId } = payload;
    if (!receiverId) return;

    const onlineMap = await this.getOnlineUsersMap();
    const isOnline = !!onlineMap[receiverId] && onlineMap[receiverId].length > 0;
    if (!isOnline) {
      return { success: false, message: 'Người dùng không trực tuyến' };
    }

    this.server.to(receiverId).emit('incoming-call', {
      callerId: user.id,
      callerName: user.fullName || user.username,
      callerAvatar: user.avatar,
    });

    return { success: true };
  }

  @SubscribeMessage('call-answer')
  handleCallAnswer(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { callerId } = payload;
    if (!callerId) return;

    this.server.to(callerId).emit('call-answered', {
      answererId: user.id,
      answererName: user.fullName || user.username,
    });
  }

  @SubscribeMessage('call-reject')
  handleCallReject(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { callerId } = payload;
    if (!callerId) return;

    this.server.to(callerId).emit('call-rejected', {
      rejecterId: user.id,
    });
  }

  @SubscribeMessage('call-end')
  handleCallEnd(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { peerId } = payload;
    if (!peerId) return;

    this.server.to(peerId).emit('call-ended', {
      enderId: user.id,
    });
  }

  @SubscribeMessage('webrtc-offer')
  handleWebRTCOffer(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId, offer } = payload;
    if (!receiverId || !offer) return;

    this.server.to(receiverId).emit('webrtc-offer', {
      senderId: user.id,
      offer,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleWebRTCAnswer(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId, answer } = payload;
    if (!receiverId || !answer) return;

    this.server.to(receiverId).emit('webrtc-answer', {
      senderId: user.id,
      answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleICECandidate(@SocketUser() user: RequestUser, @MessageBody() payload: any) {
    const { receiverId, candidate } = payload;
    if (!receiverId || !candidate) return;

    this.server.to(receiverId).emit('ice-candidate', {
      senderId: user.id,
      candidate,
    });
  }
}
