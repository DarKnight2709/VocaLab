import { Module } from '@nestjs/common';
import { DirectChatGateway } from './direct-chat.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  controllers: [], 
  providers: [DirectChatGateway],
  exports: [DirectChatGateway],
})
export class DirectChatModule {}
