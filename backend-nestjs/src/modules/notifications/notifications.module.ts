import { forwardRef, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { GroupChatModule } from '../group-chat/group-chat.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailNotificationWorker } from './workers/email-notification-worker';

import { NotificationsGateway } from './notifications.gateway';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ReminderService } from './services/reminder.service';
import { ReminderNotificationWorker } from './workers/reminder-notification-worker';
import { EmailService } from './services/email.service';
import { NotificationsService } from './services/notifications.service';
import { FirebaseProvider } from '@/core/configs/firebase.provider';

@Module({
  imports: [
    // Register the specific queue name
    BullModule.registerQueue({
      name: 'email-notification',
    }),
    BullModule.registerQueue({
      name: 'reminder-notification',
    }),

    BullBoardModule.forFeature({
      name: 'email-notification',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'reminder-notification',
      adapter: BullMQAdapter,
    }),
    forwardRef(() => GroupChatModule),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    EmailNotificationWorker,
    ReminderNotificationWorker,
    NotificationsGateway,
    ReminderService,
    FirebaseProvider,
  ],
  exports: [
    NotificationsService,
    EmailService,
    BullModule,
    NotificationsGateway,
  ],
})
export class NotificationsModule {}
