import { PrismaService } from '@/core/database/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserDeviceCleanupService {
  private readonly logger = new Logger(UserDeviceCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 1 * *', {
    name: 'cleanup-deleted-user-device',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDeletedUserDeviceCleanup() {
    this.logger.log(`[SCHEDULE] Running deleted user device cleanup job...`);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    try {
      const rawClient = (this.prisma as any).$parent;

      // 2. Thực hiện xóa (Cascade sẽ tự lo phần còn lại)
      const result = await rawClient.userDevice.deleteMany({
        where: {
          updatedAt: { lte: sixMonthsAgo },
        },
      });

      // result ở đây là { count: number }
      if (result.count > 0) {
        this.logger.log(
          `[SCHEDULE] Successfully deleted ${result.count} user devices.`,
        );
      } else {
        this.logger.log('[SCHEDULE] No user devices found for cleanup.');
      }
    } catch (error) {
      this.logger.error('[SCHEDULE] Failed to cleanup user devices', error);
    }
  }
}
