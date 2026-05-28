import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { UpdateAllowFollowDto, UpdateMessageScopeDto, UpdateFollowersTabVisibilityDto, UpdateFollowingTabVisibilityDto, UpdateFriendTabVisibilityDto } from './dto/setting.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { NotificationSettingDto, UpdateChatMessagesDto, UpdateCommentsOnPostsDto, UpdateUpvotesDto, UpdateRepliesToCommentsDto, UpdateNewFollowersDto, UpdateActivityFromFollowedDto } from './dto/notication-settings.dto';


@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAllowFollow(userId: string, dto: UpdateAllowFollowDto): Promise<void> {
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

  async updateMessageScope(userId: string, dto: UpdateMessageScopeDto): Promise<void> {
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

  async updateFollowersTabVisibility(userId: string, dto: UpdateFollowersTabVisibilityDto): Promise<void> {
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

  async updateFollowingTabVisibility(userId: string, dto: UpdateFollowingTabVisibilityDto): Promise<void> {
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

  async updateFriendTabVisibility(userId: string, dto: UpdateFriendTabVisibilityDto): Promise<void> {
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

  async updateChatMessages(userId: string, dto: UpdateChatMessagesDto): Promise<void> {
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

  async updateCommentsOnPosts(userId: string, dto: UpdateCommentsOnPostsDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { commentsOnPosts: dto.commentsOnPosts },
      create: {
        userId,
        commentsOnPosts: dto.commentsOnPosts,
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

  async updateRepliesToComments(userId: string, dto: UpdateRepliesToCommentsDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
    await this.prisma.notificationSetting.upsert({
      where: { userId },
      update: { repliesToComments: dto.repliesToComments },
      create: {
        userId,
        repliesToComments: dto.repliesToComments,
      },
    });
  }

  async updateNewFollowers(userId: string, dto: UpdateNewFollowersDto): Promise<void> {
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

  async updateActivityFromFollowed(userId: string, dto: UpdateActivityFromFollowedDto): Promise<void> {
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
      commentsOnPosts: settings.commentsOnPosts,
      upvotes: settings.upvotes,
      repliesToComments: settings.repliesToComments,
      newFollowers: settings.newFollowers,
      activityFromFollowed: settings.activityFromFollowed,
      updatedAt: settings.updatedAt,
    };
  }
}
