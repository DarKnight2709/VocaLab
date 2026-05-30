import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { GroupChatModule } from '../group-chat/group-chat.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    // Register the specific queue name
    BullModule.registerQueue({
      name: 'email-notification',
    }),
    forwardRef(() => GroupChatModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, EmailProcessor],
  exports: [NotificationsService, EmailService, BullModule],
})
export class NotificationsModule {}
