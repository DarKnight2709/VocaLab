import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { CollectionStatsResponseDto, StatsResponseDto } from './dto/stats-response.dto';

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

    // 1. Calculate Weekly Activity (Existing logic)
    const weeklyActivity: { date: string; minutes: number }[] = [];
    let weekTotalMinutes = 0;
    
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
      weekTotalMinutes += m;
    }

    const weeklyAverageMinutes = Math.floor(weekTotalMinutes / 7);

    // 2. Fetch all progress for streaks and totals
    const allProgress = await this.prisma.dailyProgress.findMany({
      where: { userId, secondsStudied: { gt: 0 } },
      orderBy: { date: 'asc' },
    });

    let totalMinutes = 0;
    let totalDays = allProgress.length;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Normalize today for streak calculation
    const todayObj = new Date(todayStr);

    for (const p of allProgress) {
      totalMinutes += Math.floor(p.secondsStudied / 60);
      const pDate = new Date(p.date);

      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(pDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }

      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }

      lastDate = pDate;
    }

    // Determine if current streak is still active
    if (lastDate) {
      const diffTime = Math.abs(todayObj.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0; // Streak broken
      }
    }

    // 3. Return all study history for the Heat Map
    const history = allProgress.map(p => ({
      date: p.date,
      count: p.cardsReviewed + p.cardsAdded + p.cardsUpdated + p.cardsDeleted,
      cardsReviewed: p.cardsReviewed,
      cardsAdded: p.cardsAdded,
      cardsUpdated: p.cardsUpdated,
      cardsDeleted: p.cardsDeleted,
    }));

    // 4. Fetch Card Mastery Stats
    const totalCards = await this.prisma.card.count({
      where: { cardCollection: { userId } },
    });

    const masteredCards = await this.prisma.card.count({
      where: { cardCollection: { userId }, interval: { gte: 21 } },
    });

    const learningCards = await this.prisma.card.count({
      where: { cardCollection: { userId }, repetitions: { gt: 0 }, interval: { lt: 21 } },
    });

    const newCards = await this.prisma.card.count({
      where: { cardCollection: { userId }, repetitions: 0 },
    });

    return {
      todayMinutes,
      dailyGoalMinutes,
      weeklyAverageMinutes,
      weeklyActivity,
      currentStreak,
      maxStreak,
      totalMinutes,
      totalDays,
      history,
      totalCards,
      masteredCards,
      learningCards,
      newCards
    };
  }

  async getCollectionStats(userId: string, collectionId: string) : Promise<CollectionStatsResponseDto> {
    const allProgress = await this.prisma.collectionDailyProgress.findMany({
      where: { userId, collectionId },
      orderBy: { date: 'asc' },
    });

    const history = allProgress.map(p => ({
      date: p.date,
      count: p.cardsReviewed + p.cardsAdded + p.cardsUpdated + p.cardsDeleted,
      cardsReviewed: p.cardsReviewed,
      cardsAdded: p.cardsAdded,
      cardsUpdated: p.cardsUpdated,
      cardsDeleted: p.cardsDeleted,
    }));

    return { history };
  }
}
