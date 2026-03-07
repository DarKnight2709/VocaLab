import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { GroupEntity } from '../domain/group.entity';
import { MemberRole } from '@prisma/client';
import { IGroupRepository, GroupWithDetails, MemberWithUser } from '../domain/interfaces/group-repository.interface';

@Injectable()
export class GroupRepository implements IGroupRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    avatar?: string;
    ownerId: string;
    members: Array<{ userId: string; role: MemberRole }>;
    rolePermissions?: Array<{ role: MemberRole; permissionId: string }>;
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
        rolePermissions: data.rolePermissions
          ? {
              create: data.rolePermissions.map((rp) => ({
                role: rp.role,
                permissionId: rp.permissionId,
              })),
            }
          : undefined,
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

    const { owner, members, ...rest } = group;
    return new GroupEntity({
      ...rest,
      avatar: group.avatar ?? undefined,
      description: group.description ?? undefined,
      members: members.map((m) => m.userId),
    });
  }

  async findById(id: string): Promise<GroupWithDetails | null> {
    return this.prisma.group.findFirst({
      where: { id, isActive: true },
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
          orderBy: { joinedAt: 'asc' },
        },
        rolePermissions: {
          where: { isEnabled: true },
          include: {
            permission: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<any[]> {
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
          orderBy: { joinedAt: 'asc' },
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
    }) as unknown as GroupWithDetails[];
  }

  async update(id: string, data: Partial<GroupEntity>): Promise<GroupWithDetails> {
    return this.prisma.group.update({
      where: { id,
        isActive: true
       },
      data: data as any,
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

  async delete(id: string): Promise<void> {
    await this.prisma.group.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addMember(groupId: string, userId: string, role: MemberRole = MemberRole.MEMBER): Promise<MemberWithUser> {
    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
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

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.prisma.groupMember.deleteMany({
      where: {
        groupId,
        userId,
      },
    });
  }

  async updateMemberRole(groupId: string, userId: string, role: MemberRole): Promise<void> {
    await this.prisma.groupMember.updateMany({
      where: {
        groupId,
        userId,
      },
      data: { role },
    });
  }

  async getMembers(groupId: string): Promise<MemberWithUser[]> {
    return this.prisma.groupMember.findMany({
      where: { 
        groupId,
        group: { isActive: true }
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
      orderBy: { joinedAt: 'asc' },
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
      include: {
        group: {
          select: { isActive: true },
        },
      },
    });
    return !!member && member.group.isActive;
  }

  async isOwner(groupId: string, userId: string) {
    const group = await this.prisma.group.findFirst({
      where: { 
        id: groupId,
        isActive: true
      },
      select: { ownerId: true },
    });
    return group?.ownerId === userId;
  }


  async transferOwnership(groupId: string, newOwnerId: string): Promise<void> {
    await this.prisma.group.update({
      where: { id: groupId },
      data: { ownerId: newOwnerId },
    });
  }

  async isHigherRole(
    groupId: string,
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const roles = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [userId, targetUserId] },
      },
      select: { userId: true, role: true },
    });

    const userRole = roles.find((r) => r.userId === userId)?.role;
    const targetRole = roles.find((r) => r.userId === targetUserId)?.role;

    if (!userRole || !targetRole) return false;

    const roleValues: Record<MemberRole, number> = {
      OWNER: 3,
      CO_OWNER: 2,
      MEMBER: 1,
    };

    return roleValues[targetRole] > roleValues[userRole];
  }

  async isSameRole(
    groupId: string,
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const roles = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [userId, targetUserId] },
      },
      select: { userId: true, role: true },
    });

    const userRole = roles.find((r) => r.userId === userId)?.role;
    const targetRole = roles.find((r) => r.userId === targetUserId)?.role;

    if (!userRole || !targetRole) return false;

    return userRole === targetRole;
  }
}

