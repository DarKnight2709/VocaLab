import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseFilters, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { NotificationDto } from './dto/notifications-response.dto';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';
import { SocketUser } from '@/common/decorators/socket-user.decorator';

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
export class NotificationsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<string, Set<string>>();

  @SubscribeMessage('entering')
  handleEntering(@SocketUser() user: any, @ConnectedSocket() client: Socket) {
    if (!user) return;

    const userId = user.id;
    const socketId = client.id;
    client.join(userId);

    let socketSet = this.onlineUsers.get(userId);
    if (!socketSet) {
      socketSet = new Set<string>();
      this.onlineUsers.set(userId, socketSet);
    }
    socketSet.add(socketId);
    
    console.log(`[NotificationsGateway] User ${userId} is online (${socketSet.size} sockets)`);
  }

  handleDisconnect(client: Socket) {
    // Note: client.user might be available if the socket was authenticated
    const user = (client as any).user;
    if (user) {
      const userId = user.id;
      const socketId = client.id;
      const socketSet = this.onlineUsers.get(userId);

      if (socketSet) {
        socketSet.delete(socketId);
        if (socketSet.size === 0) {
          this.onlineUsers.delete(userId);
          console.log(`[NotificationsGateway] User ${userId} is offline`);
        }
      }
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  sendNotificationToUser(recipientId: string, notification: NotificationDto) {
    if (this.isUserOnline(recipientId)) {
      this.server.to(recipientId).emit('receive-notification', notification);
    }
  }
}
