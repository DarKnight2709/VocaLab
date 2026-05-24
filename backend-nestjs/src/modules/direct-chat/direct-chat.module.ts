import { Module } from '@nestjs/common';
import { DirectChatGateway } from './direct-chat.gateway';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MessagesModule, UsersModule, NotificationsModule],
  controllers: [], 
  providers: [DirectChatGateway],
  exports: [DirectChatGateway],
})
export class DirectChatModule {}
