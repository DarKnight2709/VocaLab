import { Injectable } from '@nestjs/common';
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
import { CreateReminderDto, ReminderDeleteResponseDto, ReminderListResponseDto, ReminderResponseDto } from './dto/learning-setting.dto';

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAllowFollow(
    userId: string,
    dto: UpdateAllowFollowDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: { allowFollow: dto.allowFollow },
      create: {
        userId,
        allowFollow: dto.allowFollow,
      },
    });
  }

  async updateMessageScope(
    userId: string,
    dto: UpdateMessageScopeDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: { messageScope: dto.messageScope },
      create: {
        userId,
        messageScope: dto.messageScope,
      },
    });
  }

  async updateFollowersTabVisibility(
    userId: string,
    dto: UpdateFollowersTabVisibilityDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: { followersTabVisibility: dto.followersTabVisibility },
      create: {
        userId,
        followersTabVisibility: dto.followersTabVisibility,
      },
    });
  }

  async updateFollowingTabVisibility(
    userId: string,
    dto: UpdateFollowingTabVisibilityDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: { followingTabVisibility: dto.followingTabVisibility },
      create: {
        userId,
        followingTabVisibility: dto.followingTabVisibility,
      },
    });
  }

  async updateFriendTabVisibility(
    userId: string,
    dto: UpdateFriendTabVisibilityDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: { friendTabVisibility: dto.friendTabVisibility },
      create: {
        userId,
        friendTabVisibility: dto.friendTabVisibility,
      },
    });
  }

  async updateChatMessages(
    userId: string,
    dto: UpdateChatMessagesDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { chatMessages: dto.chatMessages },
      create: {
        userId,
        chatMessages: dto.chatMessages,
      },
    });
  }

  async updateComments(userId: string, dto: UpdateCommentsDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { comments: dto.comments },
      create: {
        userId,
        comments: dto.comments,
      },
    });
  }

  async updateUpvotes(userId: string, dto: UpdateUpvotesDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { upvotes: dto.upvotes },
      create: {
        userId,
        upvotes: dto.upvotes,
      },
    });
  }

  async updateNewFollowers(
    userId: string,
    dto: UpdateNewFollowersDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { newFollowers: dto.newFollowers },
      create: {
        userId,
        newFollowers: dto.newFollowers,
      },
    });
  }

  async updateActivityFromFollowed(
    userId: string,
    dto: UpdateActivityFromFollowedDto,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { activityFromFollowed: dto.activityFromFollowed },
      create: {
        userId,
        activityFromFollowed: dto.activityFromFollowed,
      },
    });
  }

  async getSettings(userId: string): Promise<NotificationSettingDto> {
    let settings = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.notificationSetting.create({
        data: { userId },
      });
    }

    return {
      chatMessages: settings.chatMessages,
      comments: (settings as any).comments,
      upvotes: settings.upvotes,
      newFollowers: settings.newFollowers,
      activityFromFollowed: settings.activityFromFollowed,
      updatedAt: settings.updatedAt,
    };
  }

  // Reminders
  async getReminders(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<ReminderListResponseDto> {
    const skip = (page - 1) * limit;
    const where: any = {
      userId,
      deletedAt: null,
    };
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
    const createdReminder = await this.prisma.reminder.create({
      data: {
        ...dto,
        userId,
      },
      select: {
        id: true,
        title: true,
        type: true,
        isEnabled: true,
        triggerTime: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
        createdAt: true,
      },
    });
    return createdReminder;
  }

  async updateReminder(
    userId: string,
    id: string,
    dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const updatedReminder = await this.prisma.reminder.update({
      where: { id, userId },
      data: dto,
      select: {
        id: true,
        title: true,
        type: true,
        isEnabled: true,
        triggerTime: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
        createdAt: true,
      },
    });
    return updatedReminder;
  }

  async toggleReminder(userId: string, id: string): Promise<void> {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id, userId },
    });
    if (!reminder) return;

    await this.prisma.reminder.update({
      where: { id, userId },
      data: { isEnabled: !reminder.isEnabled },
    });
  }

  async deleteReminder(
    userId: string,
    id: string,
  ): Promise<ReminderDeleteResponseDto> {
    const deletedReminder = await this.prisma.reminder.delete({
      where: { id, userId },
    });
    return { id: deletedReminder.id };
  }
}
