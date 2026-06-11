import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { StatsResponseDto } from './dto/stats-response.dto';

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

  async getStats(userId: string, weekOffset = 0): Promise<StatsResponseDto> {
    let setting = await this.prisma.learningSetting.findUnique({
      where: { userId },
    });
    
    if (!setting) {
      setting = await this.prisma.learningSetting.create({
        data: { userId, dailyGoalMinutes: 5 },
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayProgress = await this.prisma.dailyProgress.findUnique({
      where: { userId_date: { userId, date: todayStr }}
    });

    const todayMinutes = todayProgress ? Math.floor(todayProgress.secondsStudied / 60) : 0;
    const dailyGoalMinutes = setting.dailyGoalMinutes;

    // Calculate Monday of the target week
    const weeklyActivity: { date: string; minutes: number }[] = [];
    let totalMinutes = 0;
    
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; 
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const p = await this.prisma.dailyProgress.findUnique({
        where: { userId_date: { userId, date: dateStr }}
      });
      const m = p ? Math.floor(p.secondsStudied / 60) : 0;
      weeklyActivity.push({ date: dayName, minutes: m });
      totalMinutes += m;
    }

    const weeklyAverageMinutes = Math.floor(totalMinutes / 7);

    return {
      todayMinutes,
      dailyGoalMinutes,
      weeklyAverageMinutes,
      weeklyActivity
    };
  }
}
