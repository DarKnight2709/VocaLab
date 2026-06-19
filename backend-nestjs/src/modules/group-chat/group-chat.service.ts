import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { MemberRole, Prisma } from '@prisma/client';
import { GroupPermission } from '../../common/enums/group-permission.enum';
import { ErrorCode } from '@/common/enums/error-code.enum';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { GroupChatGateway } from './group-chat.gateway';
import { CloudinaryService } from '@/common/services/cloudinary.service';
import { MessagesService } from '../messages/messages.service';
import {
  CreateGroupResponseDto,
  GetGroupsResponseDto,
  GroupDetailDto,
  GroupMemberDto,
  GroupsSearchResultResponse,
  PermissionDto,
} from './dto/group-chat-response.dto';
import { DeleteResponseDto } from '../blog/dto/blog-response.dto';
import { MessageWithDetails } from '../messages/dto/messages-response.dto';

// Types previously in IGroupRepository
export type MemberWithUser = Prisma.GroupMemberGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        username: true;
        fullName: true;
        avatar: true;
      };
    };
  };
}>;

export type GroupWithDetails = Prisma.GroupGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        username: true;
        fullName: true;
        avatar: true;
      };
    };
    members: {
      include: {
        user: {
          select: {
            id: true;
            username: true;
            fullName: true;
            avatar: true;
          };
        };
      };
    };
    rolePermissions: {
      include: {
        permission: {
          select: { id: true; name: true };
        };
      };
    };
  };
}>;

@Injectable()
export class GroupChatService {
  constructor(
    private prisma: PrismaService,
    private readonly messagesService: MessagesService,
    private groupChatGateway: GroupChatGateway,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createGroup(
    ownerId: string,
    createDto: CreateGroupDto,
  ): Promise<CreateGroupResponseDto> {
    // Validate member IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: createDto.members } },
      select: { id: true },
    });

    if (existingUsers.length !== createDto.members.length) {
      throw new BadRequestException(ErrorCode.SOME_MEMBERS_NOT_FOUND);
    }

    const allPermissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: [
            GroupPermission.ADD_MEMBER,
            GroupPermission.REMOVE_MEMBER,
            GroupPermission.UPDATE_ROLE_PERMISSION,
            GroupPermission.UPDATE_GROUP_INFO,
          ],
        },
      },
    });

    if (allPermissions.length === 0) {
      throw new BadRequestException(ErrorCode.PERMISSION_RECORDS_NOT_FOUND);
    }

    const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    // Default permissions
    const memberPermissionNames = [
      GroupPermission.ADD_MEMBER,
      GroupPermission.UPDATE_GROUP_INFO,
    ];
    const memberRolePermissions = memberPermissionNames
      .map((name) => ({
        role: MemberRole.MEMBER,
        permissionId: permissionMap.get(name)!,
        isEnabled: true,
      }))
      .filter((rp) => rp.permissionId);

    const coOwnerPermissionNames = [
      GroupPermission.ADD_MEMBER,
      GroupPermission.REMOVE_MEMBER,
      GroupPermission.UPDATE_GROUP_INFO,
    ];
    const coOwnerRolePermissions = coOwnerPermissionNames
      .map((name) => ({
        role: MemberRole.CO_OWNER,
        permissionId: permissionMap.get(name)!,
        isEnabled: true,
      }))
      .filter((rp) => rp.permissionId);

    // Create group with transaction logic (previously in repository.create)
    const group = await this.prisma.group.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description?.trim(),
        isPublic: createDto.isPublic ?? true,
        ownerId: ownerId,
        members: {
          create: [
            { userId: ownerId, role: MemberRole.OWNER },
            ...createDto.members
              .filter((id) => id !== ownerId)
              .map((id) => ({ userId: id, role: MemberRole.MEMBER })),
          ],
        },
        rolePermissions: {
          create: [...memberRolePermissions, ...coOwnerRolePermissions],
        },
      },
      include: {
        owner: {
          select: { id: true, username: true, fullName: true, avatar: true },
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

    const memberIds = [ownerId, ...createDto.members];
    this.groupChatGateway.notifyReloadGroups(memberIds);

    return this.getInfoGroup(group.id);
  }

  async findUserGroups(userId: string) {
    return this.prisma.group.findMany({
      where: {
        members: { some: { userId } },
        isActive: true,
      },
      include: {
        owner: {
          select: { id: true, username: true, fullName: true, avatar: true },
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
    });
  }

  async getGroups(userId: string): Promise<GetGroupsResponseDto[]> {
    const groups = await this.findUserGroups(userId);
    const transformedGroups = await Promise.all(
      groups.map(async (group) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.messagesService.findLastGroupMessage(group.id),
          this.messagesService.countUnreadGroupMessages(group.id, userId),
        ]);

        return {
          id: group.id,
          name: group.name,
          avatar: group.avatar,
          description: group.description,
          isPublic: group.isPublic,
          unreadCount,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderName: lastMessage.sender?.fullName,
                isMine: lastMessage.senderId === userId,
              }
            : null,
          members: group.members?.map((m) => m.userId) || [],
          updatedAt: group.updatedAt,
        };
      }),
    );

    return transformedGroups.sort(
      (a, b) =>
        (b.lastMessage?.createdAt?.getTime() || b.updatedAt.getTime()) -
        (a.lastMessage?.createdAt?.getTime() || a.updatedAt.getTime()),
    );
  }

  async searchGroups(
    userId: string,
    page: number,
    limit: number,
    query?: string,
  ): Promise<GroupsSearchResultResponse> {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      deletedAt: null,
    };

    if (userId) {
      const blockRelations = await this.prisma.block.findMany({
        where: {
          blockedId: userId,
        },
        select: {
          blockingId: true,
        },
      });

      const blockerIds = blockRelations.map((r) => r.blockingId);

      if (blockerIds.length > 0) {
        where.ownerId = {
          notIn: blockerIds,
        };
      }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    let [searchedGroups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,

        include: {
          owner: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
          _count: { select: { members: true } },
          members: {
            select: {
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
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      groups: searchedGroups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getInfoGroup(groupId: string): Promise<GroupDetailDto> {
    const group = await this.getActiveGroupOrThrow(groupId);
    return this.transformGroupToDetail(group);
  }

  private transformGroupToDetail(group: GroupWithDetails): GroupDetailDto {
    const permissionsByRole =
      group.rolePermissions?.reduce(
        (acc: any, rp) => {
          if (!acc[rp.role]) acc[rp.role] = [];
          acc[rp.role].push(rp.permission.name);
          return acc;
        },
        {} as Record<string, string[]>,
      ) || {};

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      isPublic: group.isPublic,
      owner: group.owner,
      members:
        group.members?.map((m) => ({
          id: m.id,
          userId: m.userId,
          groupId: m.groupId,
          role: m.role,
          user: m.user,
          permissions: permissionsByRole[m.role] || [],
          joinedAt: m.joinedAt,
        })) || [],
      rolePermissions:
        group.rolePermissions?.map((rp) => ({
          role: rp.role,
          permissionId: rp.permissionId,
          isEnabled: rp.isEnabled,
        })) || [],
    };
  }

  async updateGroup(
    groupId: string,
    userId: string,
    updateDto: UpdateGroupDto,
    file?: Express.Multer.File,
  ): Promise<CreateGroupResponseDto> {
    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    const updateData: any = {};
    if (updateDto.name !== undefined) {
      const name = updateDto.name.trim();
      if (name === '')
        throw new BadRequestException(ErrorCode.GROUP_NAME_REQUIRED);
      updateData.name = name;
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description.trim();
    }
    if (file) {
      const result = await this.cloudinaryService.uploadFile(file);
      updateData.avatar = result.secure_url;
    } else if (updateDto.avatar !== undefined) {
      updateData.avatar = updateDto.avatar;
    }

    await this.prisma.group.update({
      where: { id: groupId },
      data: updateData,
    });

    this.groupChatGateway.notifyReloadGroups(memberIds, groupId);

    return this.getInfoGroup(groupId);
  }

  async updateGroupVisibility(
    groupId: string,
    userId: string,
    isPublic: boolean,
  ): Promise<CreateGroupResponseDto> {
    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    await this.prisma.group.update({
      where: { id: groupId },
      data: { isPublic },
    });

    this.groupChatGateway.notifyReloadGroups(memberIds, groupId);

    return this.getInfoGroup(groupId);
  }

  async deleteGroup(
    groupId: string,
    userId: string,
  ): Promise<DeleteResponseDto> {
    const isOwner = await this.isOwner(groupId, userId);
    if (!isOwner) {
      throw new ForbiddenException(ErrorCode.ONLY_GROUP_OWNER_CAN_DELETE);
    }

    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    const deletedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: { isActive: false },
    });

    this.groupChatGateway.notifyReloadGroups(memberIds, groupId);

    return {
      id: deletedGroup.id,
    };
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const isOwner = await this.isOwner(groupId, userId);
    if (isOwner) {
      throw new ForbiddenException(ErrorCode.OWNER_CANNOT_LEAVE_GROUP);
    }

    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    await this.prisma.groupMember.deleteMany({
      where: { groupId, userId },
    });

    this.groupChatGateway.notifyReloadGroups(memberIds, groupId);
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    // 1. Validate the group exists
    const group = await this.getActiveGroupOrThrow(groupId);

    // 2. Validate the user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    }

    // 3. Check if the user is already a member
    const alreadyMember = await this.isMember(groupId, userId);
    if (alreadyMember) {
      throw new BadRequestException(ErrorCode.ALREADY_GROUP_MEMBER);
    }

    // 4. Add the user as a member
    await this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: MemberRole.MEMBER,
      },
    });

    // 5. Notify the relevant users
    const currentMemberIds = group.members?.map((m) => m.userId) || [];
    this.groupChatGateway.notifyReloadGroups(
      [...currentMemberIds, userId],
      groupId,
    );
  }

  async getGroupMessages(groupId: string): Promise<MessageWithDetails[]> {
    return this.messagesService.findGroupMessages(groupId);
  }

  async addMember(
    groupId: string,
    userId: string,
    addMemberDto: AddMemberDto,
  ): Promise<void> {
    const group = await this.getActiveGroupOrThrow(groupId);

    // Validate member IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: addMemberDto.memberIds } },
      select: { id: true },
    });

    if (existingUsers.length !== addMemberDto.memberIds.length) {
      throw new BadRequestException(ErrorCode.SOME_MEMBERS_NOT_FOUND);
    }

    const newMembers: string[] = [];
    const existingMembers: string[] = [];

    for (const mId of addMemberDto.memberIds) {
      const alreadyMember = await this.isMember(groupId, mId);
      if (alreadyMember) {
        existingMembers.push(mId);
      } else {
        newMembers.push(mId);
      }
    }

    if (existingMembers.length === addMemberDto.memberIds.length) {
      throw new BadRequestException(ErrorCode.ALL_MEMBERS_ALREADY_EXISTS);
    }

    // Add new members
    await this.prisma.groupMember.createMany({
      data: newMembers.map((mId) => ({
        groupId,
        userId: mId,
        role: MemberRole.MEMBER,
      })),
    });

    const allMemberIds = group.members?.map((m) => m.userId) || [];
    this.groupChatGateway.notifyReloadGroups(
      [...allMemberIds, ...newMembers],
      groupId,
    );
  }

  async getMembers(groupId: string): Promise<GroupMemberDto[]> {
    const group = await this.getActiveGroupOrThrow(groupId);

    const permissionsByRole =
      group.rolePermissions?.reduce(
        (acc: any, rp) => {
          if (!acc[rp.role]) acc[rp.role] = [];
          acc[rp.role].push(rp.permission.name);
          return acc;
        },
        {} as Record<string, string[]>,
      ) || {};

    const members = await this.prisma.groupMember.findMany({
      where: { groupId, group: { isActive: true } },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      ...m,
      user: m.user,
      permissions: permissionsByRole[m.role] || [],
    }));
  }

  async deleteMember(
    groupId: string,
    userId: string,
    memberId: string,
  ): Promise<DeleteResponseDto> {
    const isTargetOwner = await this.isOwner(groupId, memberId);
    if (isTargetOwner) {
      throw new BadRequestException(ErrorCode.CANNOT_REMOVE_GROUP_OWNER);
    }

    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    const member = group.members?.find((m) => m.userId === memberId);
    if (!member) {
      throw new NotFoundException(ErrorCode.GROUP_MEMBER_NOT_FOUND);
    }

    await this.prisma.groupMember.deleteMany({
      where: { groupId, userId: memberId },
    });

    this.groupChatGateway.notifyReloadGroups(memberIds, groupId);

    return {
      id: memberId,
    };
  }

  async changeRole(
    groupId: string,
    userId: string,
    memberId: string,
    changeRoleDto: ChangeRoleDto,
  ): Promise<void> {
    const group = await this.getActiveGroupOrThrow(groupId);
    const member = group.members?.find((m) => m.userId === memberId);

    if (!member) {
      throw new NotFoundException(ErrorCode.GROUP_MEMBER_NOT_FOUND);
    }

    if (member.role === MemberRole.OWNER) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_GROUP_OWNER_ROLE);
    }

    if (userId === memberId) {
      throw new ForbiddenException(ErrorCode.CANNOT_DEMOTE_SELF);
    }

    const { userRole, targetRole } = await this.getRoles(
      groupId,
      userId,
      memberId,
    );
    if (!userRole || !targetRole)
      throw new NotFoundException(ErrorCode.GROUP_MEMBER_NOT_FOUND);

    const roleValues: Record<MemberRole, number> = {
      OWNER: 3,
      CO_OWNER: 2,
      MEMBER: 1,
    };

    if (roleValues[targetRole] > roleValues[userRole]) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_HIGHER_ROLE);
    }

    if (
      roleValues[userRole] === roleValues[targetRole] &&
      userRole !== MemberRole.OWNER
    ) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_SAME_LEVEL_ROLE);
    }

    await this.prisma.groupMember.updateMany({
      where: { groupId, userId: memberId },
      data: { role: changeRoleDto.newRole },
    });

    this.groupChatGateway.notifyReloadGroups(
      group.members?.map((m) => m.userId) || [],
      groupId,
    );

    const roleLabels: Record<string, string> = {
      OWNER: 'chủ nhóm',
      CO_OWNER: 'phó nhóm',
      MEMBER: 'thành viên',
    };
  }

  async transferOwnership(
    groupId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ): Promise<void> {
    const isOwner = await this.isOwner(groupId, currentOwnerId);
    if (!isOwner) {
      throw new ForbiddenException(ErrorCode.ONLY_OWNER_CAN_TRANSFER_OWNERSHIP);
    }

    const isTargetMember = await this.isMember(groupId, newOwnerId);
    if (!isTargetMember) {
      throw new BadRequestException(ErrorCode.NEW_OWNER_MUST_BE_MEMBER);
    }

    await this.prisma.$transaction([
      this.prisma.group.update({
        where: { id: groupId },
        data: { ownerId: newOwnerId },
      }),
      this.prisma.groupMember.update({
        where: { groupId_userId: { groupId, userId: newOwnerId } },
        data: { role: MemberRole.OWNER },
      }),
      this.prisma.groupMember.update({
        where: { groupId_userId: { groupId, userId: currentOwnerId } },
        data: { role: MemberRole.MEMBER },
      }),
    ]);

    const group = await this.getActiveGroupOrThrow(groupId);
    this.groupChatGateway.notifyReloadGroups(
      group.members?.map((m) => m.userId) || [],
      groupId,
    );
  }

  async updateRolePermission(
    groupId: string,
    updateDto: UpdateRolePermissionDto,
  ): Promise<void> {
    const group = await this.getActiveGroupOrThrow(groupId);
    await this.prisma.groupRolePermission.upsert({
      where: {
        groupId_role_permissionId: {
          groupId,
          role: updateDto.role,
          permissionId: updateDto.permissionId,
        },
      },
      update: { isEnabled: updateDto.isEnabled },
      create: {
        groupId,
        role: updateDto.role,
        permissionId: updateDto.permissionId,
        isEnabled: updateDto.isEnabled,
      },
    });

    this.groupChatGateway.notifyReloadGroups(
      group.members?.map((m) => m.userId) || [],
      groupId,
    );
  }

  async getAvailablePermissions(): Promise<PermissionDto[]> {
    return this.prisma.permission.findMany();
  }

  // Helper Methods
  async getActiveGroupOrThrow(groupId: string): Promise<GroupWithDetails> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, isActive: true },
      include: {
        owner: {
          select: { id: true, username: true, fullName: true, avatar: true },
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
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(ErrorCode.GROUP_NOT_FOUND_OR_INACTIVE);
    }
    return group as unknown as GroupWithDetails;
  }

  private async isOwner(groupId: string, userId: string): Promise<boolean> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, isActive: true },
      select: { ownerId: true },
    });
    return group?.ownerId === userId;
  }

  private async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      select: { group: { select: { isActive: true } } },
    });
    return !!member && member.group.isActive;
  }

  private async getRoles(
    groupId: string,
    userId: string,
    targetUserId: string,
  ) {
    const roles = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [userId, targetUserId] },
      },
      select: { userId: true, role: true },
    });

    return {
      userRole: roles.find((r) => r.userId === userId)?.role,
      targetRole: roles.find((r) => r.userId === targetUserId)?.role,
    };
  }
}
