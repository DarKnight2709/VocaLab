import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { PrismaService } from '@/core/database/prisma.service';
import { CreateUserDto, UpdatePersonalInfoDto } from './dto/users.dto';
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
    const {updatedAt, createdAt, email, ...rest} = user;
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
  ) {
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật tài khoản thành công',
      user: updatedUser,
    };
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

  async getFollowers(userId: string, page?: string, limit?: string, search?: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: implement follow relationship with search
    return {
      message: 'Followers chưa được triển khai',
      followers: [],
    };
  }

  async getFollowing(userId: string, page?: string, limit?: string, search?: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: implement follow relationship with search
    return {
      message: 'Following chưa được triển khai',
      following: [],
    };
  }

  async getFriends(userId: string, page?: string, limit?: string, search?: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: implement friend relationship with search
    return {
      message: 'Friends chưa được triển khai',
      friends: [],
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.blog.count({
      where: {
        authorId: userId,
        deletedAt: null,
      },
    });

    return {
      followers: 0,
      following: 0,
      friends: 0,
      posts,
    };
  }
}
