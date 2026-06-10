import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import * as admin from 'firebase-admin';
import { ReminderJobData } from '../workers/reminder-notification-worker';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
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

      if (!this.firebaseAdmin) {
        this.logger.error('Firebase Admin instance is not available');
        return;
      }

      for (const device of devices) {
        try {
          await this.firebaseAdmin.messaging().send({
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
          this.logger.error(
            `Failed to send web push notification to device ${device.id}`,
          );
          this.logger.error(`Error details: ${error.message}`);

          const isInvalidToken =
            error.code === 'messaging/registration-token-not-registered' ||
            error.message?.includes('Requested entity was not found');

          if (isInvalidToken) {
            this.logger.warn(
              `Token is expired or invalid. Removing device token from database...`,
            );

            await this.prisma.userDevice.deleteMany({
              where: {
                fcmToken: device.fcmToken,
              },
            });

            this.logger.log(
              `Successfully removed stale token for user ${data.userId}`,
            );
          }
        }
      }
    } catch (globalError: any) {
      this.logger.error(
        `Critical error encountered in sendWebPushNotification process`,
        globalError.stack,
      );
      throw globalError;
    }
  }
}
