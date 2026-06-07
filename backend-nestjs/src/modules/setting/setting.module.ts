import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    // Register the specific queue name
    BullModule.registerQueue({
      name: 'reminder-notification',
    }),
    BullBoardModule.forFeature({
      name: 'reminder-notification',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
