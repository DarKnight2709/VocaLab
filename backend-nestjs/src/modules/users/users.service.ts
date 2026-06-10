import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { PrismaService } from '@/core/database/prisma.service';
import {
  CreateUserDto,
  UpdatePersonalInfoDto,
  CreateUserSocialDto,
} from './dto/users.dto';

import { PublicUser } from './user.types';
import { mapVoteScore } from '@/common/utils/vote.utils';
import { PostVisibility } from '../../common/enums/post-visibility.enum';
import { ErrorCode } from '@/common/enums/error-code.enum';
import {
  UpdateProfileResponseDto,
  GetByUsernameResponseDto,
  SearchResponseDto,
  GetFollowersResponseDto,
  GetFollowingResponseDto,
  GetFriendsResponseDto,
  GetUserPostsResponseDto,
  FollowResponseDto,
  UserSocialDto,
  DeleteSocialResponseDto,
  UserSummaryDto,
  GetBlockedUsersResponseDto,
} from './dto/users-response.dto';
import { Follow, VisibilityScope } from '@prisma/client';
import { PrivacyVisibilityField } from '@/common/enums/privacy-visibility-field.enum';
import { NotificationType } from '@prisma/client';
import { SettingKey } from '@/common/enums/setting-key.enum';
import { NotificationsService } from '../notifications/services/notifications.service';

interface MappedUserTarget {
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
  privacySettings?: {
    allowFollow: boolean;
  } | null;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async findById(id: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        hashedPassword: true,
        fullName: true,
        email: true,
        avatar: true,
        isTwoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return null;
    const { hashedPassword, ...rest } = user;
    return {
      ...rest,
      hasPassword: !!hashedPassword,
    };
  }

  async getByUsername(
    username: string,
    currentUserId?: string,
  ): Promise<GetByUsernameResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        hashedPassword: true,
        privacySettings: true,
        _count: {
          select: {
            blogs: { where: { deletedAt: null } },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND_BY_USERNAME);
    }

    if (currentUserId && currentUserId !== user.id) {
      const blockedByTarget = await this.prisma.block.findFirst({
        where: {
          blockingId: user.id,
          blockedId: currentUserId,
        },
      });
      if (blockedByTarget) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND_BY_USERNAME);
      }
    }

    let isFollowing = false;
    let isFriend = false;
    let isBlocking = false;

    if (currentUserId && currentUserId !== user.id) {
      const follows = await this.prisma.follow.findMany({
        where: {
          OR: [
            { followerId: currentUserId, followingId: user.id },
            { followerId: user.id, followingId: currentUserId },
          ],
        },
      });
      const blocks = await this.prisma.block.findMany({
        where: {
          blockingId: currentUserId,
          blockedId: user.id,
        },
      });

      isBlocking = blocks.length > 0;

      isFollowing = follows.some(
        (f) => f.followerId === currentUserId && f.followingId === user.id,
      );
      isFriend = follows.length === 2;
    }

    const isOwner = currentUserId === user.id;

    const p = user.privacySettings;
    const allowFollow = p?.allowFollow ?? true;
    const messageScope = p?.messageScope ?? VisibilityScope.EVERYONE;
    const followersTabVisibility =
      p?.followersTabVisibility ?? VisibilityScope.EVERYONE;
    const followingTabVisibility =
      p?.followingTabVisibility ?? VisibilityScope.EVERYONE;
    const friendTabVisibility =
      p?.friendTabVisibility ?? VisibilityScope.EVERYONE;

    const checkVisibility = (scope: VisibilityScope) => {
      if (isOwner) return true;
      if (scope === VisibilityScope.EVERYONE) return true;
      if (scope === VisibilityScope.FRIENDS && isFriend) return true;
      return false;
    };

    const capabilities = {
      canFollow: isOwner ? false : allowFollow,
      canChat: isOwner ? true : checkVisibility(messageScope),
      canSeeFollowers: checkVisibility(followersTabVisibility),
      canSeeFollowing: checkVisibility(followingTabVisibility),
      canSeeFriends: checkVisibility(friendTabVisibility),
    };

    const friendsCount =
      isOwner || checkVisibility(friendTabVisibility)
        ? await this.getFriendsCount(user.id)
        : 0;
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      hasPassword: !!user.hashedPassword,
      stats: {
        followers: user._count.followers,
        following: user._count.following,
        friends: friendsCount,
        posts: user._count.blogs,
      },
      isFollowing,
      isBlocking,
      capabilities,
    };
  }

  async findByUsername(username: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async searchUsers(keyword: string, userId: string): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { username: { contains: keyword, mode: 'insensitive' } },
          { fullName: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(): Promise<PublicUser[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: CreateUserDto): Promise<PublicUser> {
    return this.prisma.user.create({
      data: {
        ...data,
        privacySettings: {
          create: {},
        },
        notificationSettings: {
          create: {},
        },
        learningSetting: {
          create: {},
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(
    userId: string,
    updateDto: UpdatePersonalInfoDto,
    file?: Express.Multer.File,
  ): Promise<UpdateProfileResponseDto> {
    const existingUser = await this.findById(userId);
    if (!existingUser) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    if (updateDto.username) {
      const existingUserByUsername = await this.findByUsername(
        updateDto.username,
      );
      if (existingUserByUsername && existingUserByUsername.id !== userId) {
        throw new ConflictException(ErrorCode.USERNAME_ALREADY_EXISTS);
      }
    }

    if (updateDto.email) {
      const existingEmail = await this.findByEmail(updateDto.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS);
      }
    }

    if (file) {
      this.logger.debug('[FILE UPLOAD] Combining with profile update');
      const result = await this.cloudinaryService.uploadFile(file);
      updateDto.avatar = result.secure_url;
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateDto,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        avatar: true,
      },
    });
  }

  async search(keyword: string, userId: string): Promise<SearchResponseDto> {
    const users = await this.searchUsers(keyword, userId);
    return {
      users,
      groups: [],
    };
  }

  async getAllUsers(): Promise<PublicUser[]> {
    return this.findAll();
  }

  async getFollowers(
    userId: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 12,
    search?: string,
  ): Promise<GetFollowersResponseDto> {
    const hasAccess = await this.validateTabAccess(
      userId,
      PrivacyVisibilityField.FOLLOWERS,
      currentUserId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(ErrorCode.PRIVATE_FOLLOWERS_ACCESS_DENIED);
    }

    const skip = (page - 1) * limit;

    const where: any = {
      followingId: userId,
    };

    if (search) {
      where.follower = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // thêm logic để không trả về nếu người dùng không cho phép xem
    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        skip,
        take: limit,
        select: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              privacySettings: {
                select: {
                  allowFollow: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.follow.count({ where }),
    ]);

    const mappedFollowers = await this.mapUsersWithCapabilities(
      followers.map((f) => f.follower),
      currentUserId,
    );

    return {
      followers: mappedFollowers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFollowing(
    userId: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 12,
    search?: string,
  ): Promise<GetFollowingResponseDto> {
    const hasAccess = await this.validateTabAccess(
      userId,
      PrivacyVisibilityField.FOLLOWING,
      currentUserId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(ErrorCode.PRIVATE_FOLLOWING_ACCESS_DENIED);
    }

    const skip = (page - 1) * limit;

    const where: any = {
      followerId: userId,
    };

    if (search) {
      where.following = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // thêm logic để không trả về nếu người dùng không cho phép xem
    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        skip,
        take: limit,
        select: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              privacySettings: {
                select: {
                  allowFollow: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.follow.count({ where }),
    ]);

    const mappedFollowing = await this.mapUsersWithCapabilities(
      following.map((f) => f.following),
      currentUserId,
    );

    return {
      following: mappedFollowing,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getFriends(
    userId: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 12,
    search?: string,
  ): Promise<GetFriendsResponseDto> {
    const hasAccess = await this.validateTabAccess(
      userId,
      PrivacyVisibilityField.FRIENDS,
      currentUserId,
    );

    if (!hasAccess) {
      throw new ForbiddenException(ErrorCode.PRIVATE_FRIENDS_ACCESS_DENIED);
    }
    const skip = (page - 1) * limit;
    const baseWhere = this.buildFriendsWhereClause(userId, search);

    // thêm logic để không trả về nếu người dùng không cho phép xem
    const [friends, total] = await Promise.all([
      this.prisma.user.findMany({
        where: baseWhere,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          privacySettings: {
            select: {
              allowFollow: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where: baseWhere }),
    ]);

    const mappedFriends = await this.mapUsersWithCapabilities(
      friends,
      currentUserId,
    );

    return {
      friends: mappedFriends,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPosts(
    profileUserId: string,
    requestingUserId?: string,
    page = 1,
    limit = 12,
    search?: string,
    visibility?: PostVisibility,
  ): Promise<GetUserPostsResponseDto> {
    const isOwner = profileUserId === requestingUserId;

    const user = await this.findById(profileUserId);
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    if (requestingUserId && requestingUserId !== profileUserId) {
      const blockedByTarget = await this.prisma.block.findFirst({
        where: {
          blockingId: profileUserId,
          blockedId: requestingUserId,
        },
      });
      if (blockedByTarget) {
        throw new ForbiddenException(ErrorCode.FORBIDDEN);
      }
    }

    const skip = (page - 1) * limit;

    const where: any = {
      authorId: profileUserId,
      deletedAt: null,
    };

    // Visibility logic
    if (visibility === PostVisibility.PUBLIC) {
      where.isPublic = true;
    } else if (visibility === PostVisibility.PRIVATE) {
      // Chỉ chủ nhân mới được xem private
      if (!isOwner)
        throw new ForbiddenException(ErrorCode.PRIVATE_POST_ACCESS_DENIED);
      where.isPublic = false;
    } else {
      // 'all' hoặc mặc định
      if (!isOwner) {
        where.isPublic = true;
      }
      // Nếu là chủ nhân thì lấy cả public và private (không set where.isPublic)
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [posts, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          votes: { select: { type: true, userId: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.blog.count({ where }),
    ]);

    const formattedPosts = posts.map((post) =>
      mapVoteScore(post, requestingUserId),
    );

    return {
      posts: formattedPosts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async followUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<FollowResponseDto> {
    if (targetUserId === currentUserId) {
      throw new ConflictException(ErrorCode.CANNOT_FOLLOW_SELF);
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { privacySettings: { select: { allowFollow: true } } },
    });

    if (!target) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    if (target.privacySettings?.allowFollow === false) {
      throw new ForbiddenException(ErrorCode.FOLLOW_ACCESS_DENIED);
    }

    // Check if there is an active block relationship between the two users
    const blockCount = await this.prisma.block.count({
      where: {
        OR: [
          { blockingId: currentUserId, blockedId: targetUserId },
          { blockingId: targetUserId, blockedId: currentUserId },
        ],
      },
    });
    if (blockCount > 0) {
      throw new ForbiddenException(ErrorCode.FOLLOW_ACCESS_DENIED);
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      return { id: targetUserId };
    }

    await this.prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    // Notify target user
    await this.notificationsService.notifyActivity({
      recipientId: targetUserId,
      senderId: currentUserId,
      type: NotificationType.FOLLOW,
      content: '',
      settingKey: SettingKey.NEW_FOLLOWERS,
    });

    return {
      id: targetUserId,
    };
  }

  async unfollowUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<FollowResponseDto> {
    if (targetUserId === currentUserId) {
      throw new ConflictException(ErrorCode.CANNOT_UNFOLLOW_SELF);
    }

    const user = await this.findById(targetUserId);
    if (!user) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
    return { id: targetUserId };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getMySocials(userId: string): Promise<UserSocialDto[]> {
    return this.prisma.userSocial.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSocial(
    userId: string,
    createDto: CreateUserSocialDto,
  ): Promise<UserSocialDto> {
    return this.prisma.userSocial.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async updateSocial(
    userId: string,
    id: string,
    updateDto: CreateUserSocialDto,
  ): Promise<UserSocialDto> {
    // Check ownership
    const social = await this.prisma.userSocial.findUnique({
      where: { id },
    });

    if (!social || social.userId !== userId) {
      throw new ForbiddenException(ErrorCode.LINK_EDIT_PERMISSION_DENIED);
    }

    return this.prisma.userSocial.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteSocial(
    userId: string,
    id: string,
  ): Promise<DeleteSocialResponseDto> {
    // Check ownership
    const social = await this.prisma.userSocial.findUnique({
      where: { id },
    });

    if (!social || social.userId !== userId) {
      throw new ForbiddenException(ErrorCode.LINK_DELETE_PERMISSION_DENIED);
    }

    await this.prisma.userSocial.delete({
      where: { id },
    });

    return { id };
  }

  async blockUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<FollowResponseDto> {
    if (targetUserId === currentUserId) {
      throw new ConflictException(ErrorCode.CANNOT_BLOCK_SELF);
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    await this.prisma.block.upsert({
      where: {
        blockingId_blockedId: {
          blockingId: currentUserId,
          blockedId: targetUserId,
        },
      },
      create: {
        blockingId: currentUserId,
        blockedId: targetUserId,
      },
      update: {},
    });

    return { id: targetUserId };
  }

  async unblockUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<FollowResponseDto> {
    if (targetUserId === currentUserId) {
      throw new ConflictException(ErrorCode.CANNOT_UNBLOCK_SELF);
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) throw new NotFoundException(ErrorCode.USER_NOT_FOUND);

    await this.prisma.block.delete({
      where: {
        blockingId_blockedId: {
          blockingId: currentUserId,
          blockedId: targetUserId,
        },
      },
    });

    return { id: targetUserId };
  }

  async getBlockedUsers(
    userId: string,
    currentUserId: string,
    page = 1,
    limit = 12,
    search?: string,
  ): Promise<GetBlockedUsersResponseDto> {
    if (userId !== currentUserId) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN);
    }

    const where: any = {
      blockingId: userId,
    };

    if (search) {
      where.blockedUser = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const total = await this.prisma.block.count({ where });
    const totalPages = Math.ceil(total / limit);

    const blocks = await this.prisma.block.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        blockedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const blockedUsers = blocks.map((b) => ({
      id: b.blockedUser.id,
      username: b.blockedUser.username,
      fullName: b.blockedUser.fullName,
      avatar: b.blockedUser.avatar,
    }));

    return {
      blockedUsers,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // HELPERS

  public async checkFriendship(
    userId1: string,
    userId2: string,
  ): Promise<boolean> {
    if (!userId1 || !userId2 || userId1 === userId2) return false;

    const mutualFollows = await this.prisma.follow.findMany({
      where: {
        OR: [
          { followerId: userId1, followingId: userId2 },
          { followerId: userId2, followingId: userId1 },
        ],
      },
    });
    return mutualFollows.length === 2;
  }

  private async validateTabAccess(
    targetUserId: string,
    tabScopeField: PrivacyVisibilityField,
    currentUserId?: string,
  ): Promise<boolean> {
    const isOwner = currentUserId === targetUserId;
    if (isOwner) return true; // Nếu là chính mình thì chắc chắn có quyền xem

    if (currentUserId) {
      const blockedByTarget = await this.prisma.block.findFirst({
        where: {
          blockingId: targetUserId,
          blockedId: currentUserId,
        },
      });
      if (blockedByTarget) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      }
    }

    // 1. CHỈ 1 QUERY DUY NHẤT: Vừa check User tồn tại, vừa lấy được Privacy Setting
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true, // Nếu query trả về null => Chứng tỏ User không tồn tại
        privacySettings: {
          select: { [tabScopeField]: true },
        },
      },
    });

    // 2. Kiểm tra nếu không tìm thấy User trong Database
    if (!targetUser) {
      throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    // 3. Trích xuất Scope (Nếu user chưa từng cập nhật setting, lấy mặc định EVERYONE)
    const privacy = targetUser.privacySettings;
    const scope = privacy ? privacy[tabScopeField] : VisibilityScope.EVERYONE;

    if (scope === VisibilityScope.EVERYONE) return true;

    // 4. Nếu cấu hình là FRIENDS, thực hiện check quan hệ bạn bè qua bảng Follow
    if (scope === VisibilityScope.FRIENDS && currentUserId) {
      return this.checkFriendship(currentUserId, targetUserId);
    }

    return false;
  }

  private buildFriendsWhereClause(userId: string, search?: string): any {
    const baseWhere: any = {
      AND: [
        { followers: { some: { followerId: userId } } },
        { following: { some: { followingId: userId } } },
      ],
    };

    if (search) {
      baseWhere.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }
    return baseWhere;
  }

  private async getFriendsCount(userId: string): Promise<number> {
    return this.prisma.user.count({
      where: this.buildFriendsWhereClause(userId),
    });
  }

  private async mapUsersWithCapabilities(
    users: MappedUserTarget[],
    currentUserId?: string,
  ): Promise<UserSummaryDto[]> {
    if (users.length === 0) return [];

    const userIds = users.map((u) => u.id);
    let followRelations: Follow[] = [];
    if (currentUserId) {
      followRelations = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: userIds },
        },
      });
    }

    return users.map((u) => {
      const isOwner = currentUserId === u.id;
      const isFollowing =
        !isOwner && currentUserId
          ? followRelations.some((f) => f.followingId === u.id)
          : false;

      const allowFollow = u.privacySettings?.allowFollow ?? true;
      const canFollow = isOwner ? false : allowFollow;

      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        avatar: u.avatar,
        isFollowing,
        canFollow,
      };
    });
  }
}
