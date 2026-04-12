import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { UserRepositoryInterface } from '../domain/interfaces/user-repository.interface';
import { CreateUserDto, UpdatePersonalInfoDto } from '../dto/users.dto';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data,
    });
    return new UserEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    return user ? new UserEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? new UserEntity(user) : null;
  }

  async update(id: string, data: UpdatePersonalInfoDto): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: data,
    });
    return new UserEntity(user);
  }

  async searchUsers(keyword: string, userId: string): Promise<UserEntity[]> {
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
    return users.map((user) => new UserEntity(user));
  }

  // test thôi

  async findAll(): Promise<UserEntity[]> {
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
    return users.map((user) => new UserEntity(user));
  }
}

