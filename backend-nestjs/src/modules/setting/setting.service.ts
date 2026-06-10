import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import {
  UpdateAllowFollowDto,
  UpdateMessageScopeDto,
  UpdateFollowersTabVisibilityDto,
  UpdateFollowingTabVisibilityDto,
  UpdateFriendTabVisibilityDto,
} from './dto/setting.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  NotificationSettingDto,
  UpdateChatMessagesDto,
  UpdateCommentsDto,
  UpdateUpvotesDto,
  UpdateNewFollowersDto,
  UpdateActivityFromFollowedDto,
} from './dto/notication-settings.dto';
import {
  CreateReminderDto,
  DailyGoalResponseDto,
  ReminderDeleteResponseDto,
  ReminderListResponseDto,
  ReminderResponseDto,
  UpdateDailyGoalDto,
} from './dto/learning-setting.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReminderJobNames } from '@/common/enums/reminder-job-names';
import { Reminder, ReminderType } from '@prisma/client';
import { minutesToTime } from '@/common/utils/convertTime';
import { randomUUID } from 'crypto';

@Injectable()
export class SettingService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('reminder-notification')
    private readonly reminderNotificationQueue: Queue,
  ) {}

  // --- PRIVACY SETTINGS (Optimized DB hits) ---

  async updateAllowFollow(
    userId: string,
    dto: UpdateAllowFollowDto,
  ): Promise<void> {
    await this.handlePrivacyUpsert(userId, { allowFollow: dto.allowFollow });
  }

  async updateMessageScope(
    userId: string,
    dto: UpdateMessageScopeDto,
  ): Promise<void> {
    await this.handlePrivacyUpsert(userId, { messageScope: dto.messageScope });
  }

  async updateFollowersTabVisibility(
    userId: string,
    dto: UpdateFollowersTabVisibilityDto,
  ): Promise<void> {
    await this.handlePrivacyUpsert(userId, {
      followersTabVisibility: dto.followersTabVisibility,
    });
  }

  async updateFollowingTabVisibility(
    userId: string,
    dto: UpdateFollowingTabVisibilityDto,
  ): Promise<void> {
    await this.handlePrivacyUpsert(userId, {
      followingTabVisibility: dto.followingTabVisibility,
    });
  }

  async updateFriendTabVisibility(
    userId: string,
    dto: UpdateFriendTabVisibilityDto,
  ): Promise<void> {
    await this.handlePrivacyUpsert(userId, {
      friendTabVisibility: dto.friendTabVisibility,
    });
  }

  private async handlePrivacyUpsert(
    userId: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.userPrivacySetting.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    } catch (error) {
      // Catch foreign key failures if user doesn't exist
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }
  }

  // --- NOTIFICATION SETTINGS ---

  async updateChatMessages(
    userId: string,
    dto: UpdateChatMessagesDto,
  ): Promise<void> {
    await this.handleNotificationUpsert(userId, {
      chatMessages: dto.chatMessages,
    });
  }

  async updateComments(userId: string, dto: UpdateCommentsDto): Promise<void> {
    await this.handleNotificationUpsert(userId, { comments: dto.comments });
  }

  async updateUpvotes(userId: string, dto: UpdateUpvotesDto): Promise<void> {
    await this.handleNotificationUpsert(userId, { upvotes: dto.upvotes });
  }

  async updateNewFollowers(
    userId: string,
    dto: UpdateNewFollowersDto,
  ): Promise<void> {
    await this.handleNotificationUpsert(userId, {
      newFollowers: dto.newFollowers,
    });
  }

  async updateActivityFromFollowed(
    userId: string,
    dto: UpdateActivityFromFollowedDto,
  ): Promise<void> {
    await this.handleNotificationUpsert(userId, {
      activityFromFollowed: dto.activityFromFollowed,
    });
  }

  private async handleNotificationUpsert(
    userId: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.notificationSetting.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    } catch (error) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }
  }

  async getSettings(userId: string): Promise<NotificationSettingDto> {
    const settings = await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: {}, // single-query get-or-create pattern
      create: { userId },
    });

    return {
      chatMessages: settings.chatMessages,
      comments: (settings as any).comments,
      upvotes: settings.upvotes,
      newFollowers: settings.newFollowers,
      activityFromFollowed: settings.activityFromFollowed,
      updatedAt: settings.updatedAt,
    };
  }

  // --- REMINDERS MANAGEMENT ---

  async getReminders(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<ReminderListResponseDto> {
    const skip = (page - 1) * limit;
    const where: any = { userId, deletedAt: null };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [reminders, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          isEnabled: true,
          triggerTime: true,
          startTime: true,
          endTime: true,
          daysOfWeek: true,
          createdAt: true,
        },
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return {
      reminders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createReminder(
    userId: string,
    dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const reminderId = randomUUID();
    const schedulerId = `reminder-cron:${userId}:${reminderId}`;

    const createdReminder = await this.prisma.reminder.create({
      data: {
        id: reminderId,
        ...dto,
        userId,
        schedulerId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isEnabled: true,
        triggerTime: true,
        schedulerId: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
        createdAt: true,
      },
    });

    if (createdReminder.isEnabled) {
      await this.addJobToReminderNotificationQueue(createdReminder, userId);
    }
    return createdReminder;
  }

  async updateReminder(
    userId: string,
    id: string,
    dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const existingReminder = await this.prisma.reminder.findUnique({
      where: { id, userId },
    });

    if (!existingReminder) {
      throw new NotFoundException(ErrorCode.REMINDER_NOT_FOUND);
    }

    const isOneTheHourReminder = dto.type === ReminderType.ON_THE_HOUR;

    if(!isOneTheHourReminder) {
      if(!dto.startTime || !dto.endTime){
        throw new BadRequestException(ErrorCode.REMINDER_LACK_TIME_FIELDS);
      }
    } else {
      if(!dto.triggerTime){
        throw new BadRequestException(ErrorCode.REMINDER_LACK_TIME_FIELDS);
      }
    }

    const updatedReminder = await this.prisma.reminder.update({
      where: { id, userId },
      data: {
        ...dto,
        triggerTime: isOneTheHourReminder ? dto.triggerTime : null,
        startTime: !isOneTheHourReminder ? dto.startTime : null,
        endTime: !isOneTheHourReminder ? dto.endTime : null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        isEnabled: true,
        triggerTime: true,
        startTime: true,
        schedulerId: true,
        endTime: true,
        daysOfWeek: true,
        createdAt: true,
      },
    });

    if (updatedReminder.isEnabled) {
      await this.addJobToReminderNotificationQueue(updatedReminder, userId);
    } else {
      await this.reminderNotificationQueue.removeJobScheduler(
        updatedReminder.schedulerId,
      );
    }

    return updatedReminder;
  }

  async toggleReminder(userId: string, id: string): Promise<void> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id, userId },
    });
    if (!reminder) throw new NotFoundException(ErrorCode.REMINDER_NOT_FOUND);

    const nextState = !reminder.isEnabled;

    const updatedReminder = await this.prisma.reminder.update({
      where: { id, userId },
      data: { isEnabled: nextState },
    });

    if (nextState) {
      await this.addJobToReminderNotificationQueue(updatedReminder, userId);
    } else {
      await this.reminderNotificationQueue.removeJobScheduler(
        reminder.schedulerId,
      );
    }
  }

  async deleteReminder(
    userId: string,
    id: string,
  ): Promise<ReminderDeleteResponseDto> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id, userId },
    });

    if (!reminder) {
      throw new NotFoundException(ErrorCode.REMINDER_NOT_FOUND);
    }

    await this.reminderNotificationQueue.removeJobScheduler(
      reminder.schedulerId,
    );
    await this.prisma.reminder.delete({ where: { id, userId } });

    return { id };
  }

  // --- HELPERS ---

  private createCronPattern(
    reminder: Omit<Reminder, 'updatedAt' | 'deletedAt' | 'user' | 'userId'>,
    isOneTheHourReminder: boolean,
  ): string {
    const days = reminder.daysOfWeek.join(',');

    if (isOneTheHourReminder) {
      const [hour, minute] = minutesToTime(reminder.triggerTime).split(':');
      // FIX: Parse integer values to safely remove leading zeros ("05" -> 5)
      return `${Number(minute)} ${Number(hour)} * * ${days}`;
    }

    const [startHour] = minutesToTime(reminder.startTime).split(':');
    const [endHour] = minutesToTime(reminder.endTime).split(':');
    const intervalTime = reminder.type.split('_');
    const type = intervalTime[intervalTime.length - 1];
    const value =
      type === 'HOUR' ? 1 : Number(intervalTime[intervalTime.length - 2]);

    const range = `${Number(startHour)}-${Number(endHour)}`;

    if (type === 'HOURS' || type === 'HOUR') {
      return `0 */${value} ${range} * * ${days}`;
    }
    return `*/${value} ${range} * * ${days}`;
  }

  private async addJobToReminderNotificationQueue(
    reminder: Omit<Reminder, 'updatedAt' | 'deletedAt' | 'user' | 'userId'>,
    userId: string,
  ): Promise<void> {
    const isOneTheHourReminder = reminder.type === ReminderType.ON_THE_HOUR;
    const cronPattern = this.createCronPattern(reminder, isOneTheHourReminder);

    await this.reminderNotificationQueue.upsertJobScheduler(
      reminder.schedulerId,
      { pattern: cronPattern },
      {
        name: ReminderJobNames.REMINDER_VIA_WEB_PUSH_NOTIFICATION,
        data: {
          title: reminder.title,
          description: reminder.description,
          reminderId: reminder.id,
          userId,
          triggerTime: isOneTheHourReminder ? reminder.triggerTime : null,
          startTime: !isOneTheHourReminder ? reminder.startTime : null,
          endTime: !isOneTheHourReminder ? reminder.endTime : null,
          isOneTheHourReminder,
        },
        opts: {
          backoff: 3,
          attempts: 5,
          removeOnComplete: { count: 10, age: 24 * 3600 },
          removeOnFail: { count: 50 },
        },
      },
    );
  }

  async getDailyGoal(userId: string): Promise<DailyGoalResponseDto> {
    const dailyGoal = await this.prisma.learningSetting.findUnique({
      where: {
        userId
      },
      select: {
        id: true,
        dailyGoalMinutes: true,
      }
    })

    if(!dailyGoal) {
      throw new NotFoundException(ErrorCode.DAILY_GOAL_NOT_FOUND);
    }

    return dailyGoal;
  }

  async updateDailyGoal(userId: string, updateDto: UpdateDailyGoalDto): Promise<DailyGoalResponseDto> {
    const dailyGoal = await this.prisma.learningSetting.findUnique({
      where: {
        userId
      },
      select: {
        id: true,
        dailyGoalMinutes: true,
      }
    })

    if(!dailyGoal) {
      throw new NotFoundException(ErrorCode.DAILY_GOAL_NOT_FOUND);
    }

    const updatedDailyGoal = await this.prisma.learningSetting.update({
      where: {
        id: dailyGoal.id
      },
      data: {
        dailyGoalMinutes: updateDto.dailyGoalMinutes
      },
      select: {
        id: true,
        dailyGoalMinutes: true,
      }
    })

    return updatedDailyGoal;
  }
}
