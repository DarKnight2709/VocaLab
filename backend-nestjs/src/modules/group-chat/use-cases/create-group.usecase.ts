import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { PrismaService } from '../../../core/database/prisma.service';
import { MemberRole } from '@prisma/client';
import { GroupPermission } from '../../../common/enums/group-permission.enum';

export interface CreateGroupInput {
  ownerId: string;
  name: string;
  description?: string;
  memberIds: string[];
}

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
    private prisma: PrismaService,
  ) {}

  async execute(input: CreateGroupInput) {
    // Validate member IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: { in: input.memberIds },
      },
      select: { id: true },
    });

    if (existingUsers.length !== input.memberIds.length) {
      throw new BadRequestException('Một số thành viên không tồn tại!');
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
      throw new BadRequestException('Không tìm thấy các bản ghi Permission trong hệ thống. Vui lòng chạy seed!');
    }

    const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    // Quyền mặc định cho MEMBER
    const memberPermissionNames = [GroupPermission.ADD_MEMBER, GroupPermission.UPDATE_GROUP_INFO];
    const memberRolePermissions = memberPermissionNames
      .map((name) => ({
        role: MemberRole.MEMBER,
        permissionId: permissionMap.get(name),
      }))
      .filter((rp) => rp.permissionId);

    // Quyền mặc định cho CO_OWNER
    const coOwnerPermissionNames = [
      GroupPermission.ADD_MEMBER,
      GroupPermission.REMOVE_MEMBER,
      GroupPermission.UPDATE_GROUP_INFO,
    ];
    const coOwnerRolePermissions = coOwnerPermissionNames
      .map((name) => ({
        role: MemberRole.CO_OWNER,
        permissionId: permissionMap.get(name),
      }))
      .filter((rp) => rp.permissionId);

    const rolePermissions = [...memberRolePermissions, ...coOwnerRolePermissions] as Array<{
      role: MemberRole;
      permissionId: string;
    }>;

    // Create members array with owner
    const members = [
      { userId: input.ownerId, role: MemberRole.OWNER as MemberRole },
      ...input.memberIds
        .filter((id) => id !== input.ownerId)
        .map((id) => ({ userId: id, role: MemberRole.MEMBER as MemberRole })),
    ];

    const group = await this.groupRepository.create({
      name: input.name.trim(),
      description: input.description?.trim(),
      ownerId: input.ownerId,
      members,
      rolePermissions,
    });

    return group;
  }
}

