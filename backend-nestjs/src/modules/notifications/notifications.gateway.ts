import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseFilters, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketAuthGuard } from '../../common/guards/socket-auth.guard';
import { NotificationDto } from './dto/notifications-response.dto';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';

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
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const user = (client as any).user;
    if (user) {
      client.join(user.id);
      console.log(`[NotificationsGateway] User ${user.id} joined room`);
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user) {
      client.leave(user.id);
      console.log(`[NotificationsGateway] User ${user.id} left room`);
    }
  }

  sendNotificationToUser(recipientId: string, notification: NotificationDto) {
    this.server.to(recipientId).emit('receive-notification', notification);
  }
}
