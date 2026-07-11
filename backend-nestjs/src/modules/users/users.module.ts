import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { UserCleanupService } from './user_cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { VocabularyModule } from '../vocabulary/vocabulary.module';
import { GroupChatModule } from '../group-chat/group-chat.module';


@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    forwardRef(() => VocabularyModule),
    forwardRef(() => GroupChatModule),
  ],
  controllers: [UsersController],
  providers: [UserService, UserCleanupService],
  exports: [UserService, UserCleanupService],
})
export class UsersModule {}

