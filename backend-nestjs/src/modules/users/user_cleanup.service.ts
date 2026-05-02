import { PrismaService } from '@/core/database/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserCleanupService {
  private readonly logger = new Logger(UserCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *', {
    name: 'cleanup-deleted-user',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDeletedUserCleanup() {
    this.logger.log(`[SCHEDULE] Running deleted user cleanup job...`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const rawClient = (this.prisma as any).$parent;

      // 2. Thực hiện xóa (Cascade sẽ tự lo phần còn lại)
      const result = await rawClient.user.deleteMany({
        where: {
          deletedAt: { lte: thirtyDaysAgo },
        },
      });

      // result ở đây là { count: number }
      if (result.count > 0) {
        this.logger.log(
          `[SCHEDULE] Successfully deleted ${result.count} users.`,
        );
      } else {
        this.logger.log('[SCHEDULE] No users found for cleanup.');
      }
    } catch (error) {
      this.logger.error('[SCHEDULE] Failed to cleanup users', error);
    }
  }
}
