import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateUserDto, UpdatePersonalInfoDto, UpdatePersonalInfoResponseDto } from './dto/users.dto';
import { CreateUserSocialDto } from './dto/social-link.dto';
import { PublicUser } from './user.types';
import { mapVoteScore } from '@/common/utils/vote.utils';
import { PostVisibility } from '../../common/enums/post-visibility.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findById(id: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    return user;
  }

  async getByUsername(username: string) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    const { updatedAt, createdAt, email, ...rest } = user;
    return {
      ...rest,
    };
  }

  async findByUsername(username: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
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
    return user;
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    const user = await this.prisma.user.findUnique({
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
    return user;
  }

  async searchUsers(keyword: string, userId: string): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
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

    return users;
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.prisma.user.findMany({
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

    return users;
  }

  async create(data: CreateUserDto): Promise<PublicUser> {
    const user = await this.prisma.user.create({
      data,
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

    return user;
  }

  async updateProfile(
    userId: string,
    updateDto: UpdatePersonalInfoDto,
    file?: Express.Multer.File,
  ): Promise< UpdatePersonalInfoResponseDto> {
    const existingUser = await this.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.username) {
      const existingUserByUsername = await this.findByUsername(
        updateDto.username,
      );
      if (existingUserByUsername && existingUserByUsername.id !== userId) {
        throw new ConflictException('Username này đã tồn tại');
      }
    }

    if (updateDto.email) {
      const existingEmail = await this.findByEmail(updateDto.email);
      if (existingEmail && existingEmail.id !== userId) {
        throw new ConflictException('Email này đã tồn tại');
      }
    }

    if (file) {
      this.logger.debug('[FILE UPLOAD] Combining with profile update');
      const result = await this.cloudinaryService.uploadFile(file);
      updateDto.avatar = result.secure_url;
    }

    const updatedUser = await this.prisma.user.update({
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

    return updatedUser;
  }

  async search(keyword: string, userId: string) {
    const users = await this.searchUsers(keyword, userId);
    return {
      message: 'Tìm kiếm thành công!',
      users,
      groups: [],
    };
  }

  async getAllUsers() {
    return this.findAll();
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 12,
    search?: string,
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
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
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where }),
    ]);

    return {
      followers: followers.map((follower) => follower.follower),
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
    page: number = 1,
    limit: number = 12,
    search?: string,
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
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
        include: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where }),
    ]);

    return {
      following: following.map((following) => following.following),
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
    page: number = 1,
    limit: number = 12,
    search?: string,
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const baseWhere: any = {
      AND: [
        { followers: { some: { followerId: userId } } }, // Những người mình đang follow họ
        { following: { some: { followingId: userId } } }, // Và họ cũng đang follow lại mình
      ],
      ...where,
    };

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
        },
      }),
      this.prisma.user.count({ where: baseWhere }),
    ]);

    return {
      friends,
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
  ) {
    const isOwner = profileUserId === requestingUserId;

    const user = await this.findById(profileUserId);
    if (!user) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;

    const where: any = {
      authorId: profileUserId,
      deletedAt: null as null,
    };

    // Visibility logic
    if (visibility === PostVisibility.PUBLIC) {
      where.isPublic = true;
    } else if (visibility === PostVisibility.PRIVATE) {
      // Chỉ chủ nhân mới được xem private
      if (!isOwner)
        throw new ForbiddenException(
          'Bạn không có quyền xem bài viết riêng tư',
        );
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

  async getUserStats(userId: string) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [posts, followersCount, followingCount, friendsCount] =
      await Promise.all([
        this.prisma.blog.count({
          where: {
            authorId: userId,
            deletedAt: null,
          },
        }),
        this.prisma.follow.count({
          where: {
            followingId: userId,
          },
        }),
        this.prisma.follow.count({
          where: {
            followerId: userId,
          },
        }),
        this.prisma.user.count({
          where: {
            AND: [
              { followers: { some: { followerId: userId } } },
              { following: { some: { followingId: userId } } },
            ],
          },
        }),
      ]);

    return {
      followers: followersCount,
      following: followingCount,
      friends: friendsCount,
      posts,
    };
  }

  async checkFollowStatus(targetUserId: string, currentUserId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
    return { isFollowing: !!follow };
  }

  async followUser(targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new ConflictException('Bạn không thể tự theo dõi chính mình');
    }

    const user = await this.findById(targetUserId);
    if (!user) throw new NotFoundException('User không tồn tại');

    const follow = await this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
      create: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
      update: {}, // Nếu đã follow rồi thì không làm gì cả
    });
    return { message: 'Theo dõisdfsdf thành công', follow };
  }

  async unfollowUser(targetUserId: string, currentUserId: string) {
    const user = await this.findById(targetUserId);
    if (!user) throw new NotFoundException('User không tồn tại');

    try {
      const follow = await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      return { message: 'Bỏ theo dõi thành công', follow };
    } catch (error) {
      // Nếu không tìm thấy bản ghi (đã unfollow rồi), vẫn trả về thành công để tránh lỗi UI
      return { message: 'Đã bỏ theo dõi' };
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getMySocials(userId: string) {
    return this.prisma.userSocial.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createSocial(userId: string, createDto: CreateUserSocialDto) {
    return this.prisma.userSocial.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async updateSocial(userId: string, id: string, updateDto: CreateUserSocialDto) {
    // Check ownership
    const social = await this.prisma.userSocial.findUnique({
      where: { id },
    });

    if (!social || social.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa liên kết này');
    }

    return this.prisma.userSocial.update({
      where: { id },
      data: updateDto,
    });
  }

  async deleteSocial(userId: string, id: string) {
    // Check ownership
    const social = await this.prisma.userSocial.findUnique({
      where: { id },
    });

    if (!social || social.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa liên kết này');
    }

    await this.prisma.userSocial.delete({
      where: { id },
    });

    return { message: 'Xóa liên kết thành công' };
  }
}
