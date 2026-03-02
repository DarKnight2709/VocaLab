import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  IGroupRepository,
  IGROUP_REPOSITORY,
  MemberWithUser,
  GroupWithDetails,
} from '../domain/interfaces/group-repository.interface';
import { CreateGroupUseCase } from '../use-cases/create-group.usecase';
import { JoinGroupUseCase } from '../use-cases/join-group.usecase';
import { LeaveGroupUseCase } from '../use-cases/leave-group.usecase';
import { UpdateGroupUseCase } from '../use-cases/update-group.usecase';
import { AddMemberUseCase } from '../use-cases/add-member.usecase';
import { RemoveMemberUseCase } from '../use-cases/remove-member.usecase';
import { ChangeRoleUseCase } from '../use-cases/change-role.usecase';
import {
  IMESSAGES_REPOSITORY,
  MessagesRepositoryInterface,
} from '../../messages/domain/interfaces/messages-repository.interface';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { GroupChatGateway } from '../group-chat.gateway';

@Injectable()
export class GroupChatService {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
    private createGroupUseCase: CreateGroupUseCase,
    private joinGroupUseCase: JoinGroupUseCase,
    private leaveGroupUseCase: LeaveGroupUseCase,
    private updateGroupUseCase: UpdateGroupUseCase,
    private addMemberUseCase: AddMemberUseCase,
    private removeMemberUseCase: RemoveMemberUseCase,
    private changeRoleUseCase: ChangeRoleUseCase,
    @Inject(IMESSAGES_REPOSITORY)
    private messageRepository: MessagesRepositoryInterface,
    private groupChatGateway: GroupChatGateway,
  ) {}

  async createGroup(ownerId: string, createDto: CreateGroupDto) {
    const group = await this.createGroupUseCase.execute({
      ownerId,
      name: createDto.name,
      description: createDto.description,
      memberIds: createDto.members,
    });

    const memberIds = [ownerId, ...createDto.members];
    this.groupChatGateway.notifyReloadGroups(memberIds);

    return {
      message: 'Tạo nhóm thành công',
      group: {
        ...group,
        members: group.members?.map((m) => m.userId) || [],
      },
    };
  }

  async getGroups(userId: string) {
    const groups = await this.groupRepository.findByUserId(userId);

    // Transform to match expected format with lastMessage and unreadCount
    const transformedGroups = await Promise.all(
      groups.map(async (group) => {
        const [lastMessage, unreadCount] = await Promise.all([
          this.messageRepository.findLastGroupMessage(group.id),
          this.messageRepository.countUnreadGroupMessages(group.id, userId),
        ]);

        return {
          id: group.id,
          name: group.name,
          avatar: group.avatar,
          description: group.description,
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

    return {
      success: true,
      groups: transformedGroups.sort(
        (a, b) =>
          (b.lastMessage?.createdAt?.getTime() || b.updatedAt.getTime()) -
          (a.lastMessage?.createdAt?.getTime() || a.updatedAt.getTime()),
      ),
    };
  }

  async getInfoGroup(groupId: string, userId: string) {
    const group = await this.getActiveGroupOrThrow(groupId);

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

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
      message: 'Lấy thông tin nhóm thành công',
      group: {
        ...group,
        members:
          group.members?.map((m) => ({
            ...m,
            user: m.user,
            permissions: permissionsByRole[m.role] || [],
          })) || [],
      },
    };
  }

  async updateGroup(
    groupId: string,
    userId: string,
    updateDto: UpdateGroupDto,
  ) {
    // gửi thông báo đến các thành viên trong nhóm để reload lại
    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];
    await this.updateGroupUseCase.execute({
      groupId,
      userId,
      data: updateDto,
    });

    this.groupChatGateway.notifyReloadGroups(memberIds);

    // gửi message cho nhóm là người đã đã thay đổi những gì (như một message nhưng type khác để in nghiên lên trên phần chat)

    return {
      message: 'Cập nhật thông tin nhóm thành công',
    };
  }

  // thay đổi leaveGroup thành deleteGroup
  // tách 2 case này ra riêng biệt
  async deleteGroup(groupId: string, userId: string) {
    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    await this.leaveGroupUseCase.execute(groupId, userId);

    this.groupChatGateway.notifyReloadGroups(memberIds);

    return {
      message: 'Xóa nhóm thành công',
    };
  }

  async getGroupMessages(groupId: string, userId: string) {
    const group = await this.getActiveGroupOrThrow(groupId);

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên nhóm này');
    }

    const messages = await this.messageRepository.findGroupMessages(groupId);
    return {
      message: 'Lấy tin nhắn thành công',
      messages,
    };
  }

  async addMember(groupId: string, userId: string, addMemberDto: AddMemberDto) {
    const group = await this.getActiveGroupOrThrow(groupId);
    const result = await this.addMemberUseCase.execute({
      groupId,
      userId,
      data: addMemberDto,
    });

    const memberIds = [...result.newMembers, ...result.existingMembers];
    this.groupChatGateway.notifyReloadGroups(memberIds);

    // gửi message cho nhóm là người đã đã thay đổi những gì (như một message nhưng type khác để in nghiên lên trên phần chat)

    return {
      message: 'Thêm thành viên vào nhóm thành công',
      ...result,
    };
  }

  async getMembers(groupId: string, userId: string) {
    const group = await this.getActiveGroupOrThrow(groupId);

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    const permissionsByRole =
      group.rolePermissions?.reduce(
        (acc: any, rp) => {
          if (!acc[rp.role]) acc[rp.role] = [];
          acc[rp.role].push(rp.permission.name);
          return acc;
        },
        {} as Record<string, string[]>,
      ) || {};

    const members = await this.groupRepository.getMembers(groupId);
    const transformedMembers = members.map((m) => {
      return {
        ...m,
        user: m.user,
        permissions: permissionsByRole[m.role] || [],
      };
    });

    return {
      message: 'Lấy danh sách thành viên thành công',
      members: transformedMembers,
    };
  }

  async deleteMember(groupId: string, userId: string, memberId: string) {
    const group = await this.getActiveGroupOrThrow(groupId);
    const memberIds = group.members?.map((m) => m.userId) || [];

    await this.removeMemberUseCase.execute({
      groupId,
      userId,
      memberId,
    });

    this.groupChatGateway.notifyReloadGroups(memberIds);

    // gửi message cho nhóm là người đã đã thay đổi những gì (như một message nhưng type khác để in nghiên lên trên phần chat)

    return {
      message: 'Đã xóa thành công thành viên này khỏi nhóm',
    };
  }

  async changeRole(
    groupId: string,
    userId: string,
    memberId: string,
    changeRoleDto: ChangeRoleDto,
  ) {
    const updated = await this.changeRoleUseCase.execute({
      groupId,
      userId,
      memberId,
      data: changeRoleDto,
    });

    const roleLabels: Record<string, string> = {
      OWNER: 'chủ nhóm',
      CO_OWNER: 'phó nhóm',
      MEMBER: 'thành viên',
    };

    return {
      message: `Đã đổi quyền thành ${roleLabels[changeRoleDto.newRole] || changeRoleDto.newRole}`,
      group: updated,
    };
  }

  private async getActiveGroupOrThrow(groupId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException(
        'Nhóm không tồn tại hoặc không còn hoạt động',
      );
    }
    return group;
  }
}
