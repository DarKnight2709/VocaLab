import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async handleHeartbeat(userId: string, seconds: number) {
    const today = new Date().toISOString().split('T')[0];

    return await this.prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        secondsStudied: {
          increment: seconds,
        },
      },
      create: {
        userId,
        date: today,
        secondsStudied: seconds,
      },
    });
  }
}
