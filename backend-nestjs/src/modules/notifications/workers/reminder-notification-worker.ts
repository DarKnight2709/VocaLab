import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReminderJobNames } from '@/common/enums/reminder-job-names';
import { ReminderService } from '../services/reminder.service';

export interface ReminderJobData {
  title: string;
  description: string | null;
  reminderId: string;
  userId: string;
  startTime: string | null;
  endTime: string | null;
  isOneTheHourReminder: boolean;
}

@Processor('reminder-notification', { concurrency: 20})
export class ReminderNotificationWorker extends WorkerHost {
  private readonly logger = new Logger(ReminderNotificationWorker.name);

  constructor(
    private readonly reminderService: ReminderService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case ReminderJobNames.REMINDER_VIA_WEB_PUSH_NOTIFICATION: {
          const data: ReminderJobData = job.data;
          await this.reminderService.sendWebPushNotification(data);
          break;
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to process job ${job.id} (${job.name}): ${error.message}`,
        error.stack,
      );
      throw error; // Rethrow to allow BullMQ to handle retries
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} (${job.name}) completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
  }
}
