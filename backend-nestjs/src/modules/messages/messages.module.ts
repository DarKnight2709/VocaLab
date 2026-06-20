import { forwardRef, Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { UsersModule } from '../users/users.module';
import { GroupChatModule } from '../group-chat/group-chat.module';

@Module({
  imports: [forwardRef(() => UsersModule),
    forwardRef(() => GroupChatModule)
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
