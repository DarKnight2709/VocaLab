import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './services/messages.service';
import { MessagesRepository } from './repositories/messages.repository';
import { IMESSAGES_REPOSITORY } from './domain/interfaces/messages-repository.interface';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    {
      provide: IMESSAGES_REPOSITORY,
      useClass: MessagesRepository,
    },
  ],
  exports: [MessagesService, IMESSAGES_REPOSITORY],
})
export class MessagesModule {}
