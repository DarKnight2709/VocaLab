import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { GroupChatModule } from '../group-chat/group-chat.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    // Register the specific queue name
    BullModule.registerQueue({
      name: 'email-notification',
    }),
    forwardRef(() => GroupChatModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, EmailProcessor, NotificationsGateway],
  exports: [NotificationsService, EmailService, BullModule, NotificationsGateway],
})
export class NotificationsModule {}
