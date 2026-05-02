import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { UserCleanupService } from './user_cleanup.service';


@Module({
  controllers: [UsersController],
  providers: [UserService, UserCleanupService],
  exports: [UserService, UserCleanupService],
})
export class UsersModule {}

