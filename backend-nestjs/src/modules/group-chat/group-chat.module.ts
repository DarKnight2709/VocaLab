import { forwardRef, Module } from '@nestjs/common';
import { GroupChatGateway } from './group-chat.gateway';
import { GroupChatController } from './group-chat.controller';
import { GroupChatService } from './group-chat.service';
import { MessagesModule } from '../messages/messages.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GroupPermissionGuard } from './guards/group-permission.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => MessagesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [GroupChatController],
  providers: [
    GroupChatGateway,
    GroupChatService,
    GroupPermissionGuard,
  ],
  exports: [GroupChatGateway, GroupChatService],
})
export class GroupChatModule {}
