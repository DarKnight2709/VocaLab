import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { UpdateAllowFollowDto, UpdateMessageScopeDto, UpdateFollowersTabVisibilityDto, UpdateFollowingTabVisibilityDto, UpdateFriendTabVisibilityDto } from './dto/setting.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';

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
}
