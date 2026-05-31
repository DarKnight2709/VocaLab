import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { UserCleanupService } from './user_cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [UsersController],
  providers: [UserService, UserCleanupService],
  exports: [UserService, UserCleanupService],
})
export class UsersModule {}

