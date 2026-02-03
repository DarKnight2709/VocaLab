import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { GroupEntity } from '../domain/group.entity';
import { MemberRole } from '@prisma/client';
import { IGroupRepository } from '../domain/interfaces/group-repository.interface';

@Injectable()
export class GroupRepository implements IGroupRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    avatar?: string;
    ownerId: string;
    members: Array<{ userId: string; role: string }>;
  }): Promise<GroupEntity> {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        ownerId: data.ownerId,
        members: {
          create: data.members.map((m) => ({
            userId: m.userId,
            role: m.role as MemberRole,
          })),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return new GroupEntity({
      ...group,
      avatar: group.avatar ?? undefined,
      description: group.description ?? undefined,
    });
  }

  async findById(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
        isActive: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<GroupEntity>) {
    return this.prisma.group.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.group.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addMember(groupId: string, userId: string, role: string = 'member') {
    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: role as MemberRole,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async removeMember(groupId: string, userId: string) {
    return this.prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });
  }

  async updateMemberRole(groupId: string, userId: string, role: string) {
    return this.prisma.groupMember.updateMany({
      where: {
        groupId,
        userId,
      },
      data: { role: role as MemberRole },
    });
  }

  async getMembers(groupId: string) {
    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async isMember(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    return !!member;
  }

  async isAdmin(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    return member?.role === 'admin';
  }

  async isOwner(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerId: true },
    });
    return group?.ownerId === userId;
  }
}

