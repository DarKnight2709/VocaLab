import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import * as admin from 'firebase-admin';
import { ReminderJobData } from '../workers/reminder-notification-worker';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: any,
  ) {}

  async sendWebPushNotification(data: ReminderJobData): Promise<void> {
    try {
      if (!data.isOneTheHourReminder) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        if (
          currentMinutes < Number(data.startTime) ||
          currentMinutes > Number(data.endTime)
        ) {
          console.log(`Job skipped: current time is outside exact boundaries.`);
          return;
        }
      }

      // process with sending via web push notification
      // get all devices of user
      const devices = await this.prisma.userDevice.findMany({
        where: {
          userId: data.userId,
        },
      });

      for (const device of devices) {
        try {
          await admin.messaging().send({
            token: device.fcmToken,
            notification: {
              title: data.title,
              body: data.description || '',
            },
            data: {
              url: '/',
            },
          });
          this.logger.log(`Web push notification sent to device ${device.id}`);
        } catch (error: any) {
          this.logger.error(`Failed to send web push notification to device ${device.id}`, error.stack);
        }
      }

      this.logger.log(`Email successfully dispatched to`);
    } catch (error: any) {
      this.logger.error(`Failed to send email notification to `, error.stack);
      throw error;
    }
  }
}
