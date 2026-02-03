import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { CreateGroupUseCase } from '../use-cases/create-group.usecase';
import { JoinGroupUseCase } from '../use-cases/join-group.usecase';
import { LeaveGroupUseCase } from '../use-cases/leave-group.usecase';
import { UpdateGroupUseCase } from '../use-cases/update-group.usecase';
import { AddMemberUseCase } from '../use-cases/add-member.usecase';
import { RemoveMemberUseCase } from '../use-cases/remove-member.usecase';
import { ChangeRoleUseCase } from '../use-cases/change-role.usecase';
import { IMESSAGES_REPOSITORY, MessagesRepositoryInterface } from '../../messages/domain/interfaces/messages-repository.interface';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { PrismaService } from '../../../core/database/prisma.service';

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
    private prisma: PrismaService,
  ) {}

  async createGroup(ownerId: string, createDto: CreateGroupDto) {
    const group = await this.createGroupUseCase.execute({
      ownerId,
      name: createDto.name,
      description: createDto.description,
      memberIds: createDto.members,
    });

    return {
      message: 'Tạo nhóm thành công',
      group: {
        ...group,
        members: group.members?.map((m: any) => m.userId) || [],
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
           this.messageRepository.countUnreadGroupMessages(group.id, userId)
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
          members: group.members?.map((m: any) => m.userId) || [],
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
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

    return {
      message: 'Lấy thông tin nhóm thành công',
      group: {
        ...group,
        members: group.members?.map((m: any) => m.userId) || [],
      },
    };
  }

  async updateGroup(groupId: string, userId: string, updateDto: UpdateGroupDto) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên nhóm này');
    }

    const isAdmin = await this.groupRepository.isAdmin(groupId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin được thay đổi thông tin nhóm');
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) {
      if (updateDto.name.trim() === '') {
        throw new BadRequestException('Tên nhóm không được để trống');
      }
      updateData.name = updateDto.name.trim();
    }
    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description.trim();
    }
    if (updateDto.avatar !== undefined) {
      updateData.avatar = updateDto.avatar;
    }

    const updated = await this.groupRepository.update(groupId, updateData);
    return {
      message: 'Cập nhật thành công',
      group: {
        ...updated,
        members: updated.members?.map((m: any) => m.userId) || [],
      },
    };
  }

  async deleteGroup(groupId: string, userId: string) {
    return this.leaveGroupUseCase.execute(groupId, userId);
  }

  async getGroupMessages(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

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
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên nhóm này');
    }

    // Validate member IDs
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: addMemberDto.memberIds } },
      select: { id: true },
    });

    if (existingUsers.length !== addMemberDto.memberIds.length) {
      throw new BadRequestException('Một số thành viên không tồn tại');
    }

    const newMembers: string[] = [];
    const existingMembers: string[] = [];

    for (const memberId of addMemberDto.memberIds) {
      const alreadyMember = await this.groupRepository.isMember(groupId, memberId);
      if (alreadyMember) {
        existingMembers.push(memberId);
      } else {
        newMembers.push(memberId);
      }
    }

    if (existingMembers.length === addMemberDto.memberIds.length) {
      throw new BadRequestException('Tất cả thành viên đã có sẵn trong nhóm');
    }

    // Add new members
    for (const memberId of newMembers) {
      await this.groupRepository.addMember(groupId, memberId, 'member');
    }

    return {
      message: 'Thêm thành viên thành công',
      existingMembers,
      newMembers,
    };
  }

  async getMembers(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    const members = await this.groupRepository.getMembers(groupId);
    return {
      message: 'Lấy danh sách thành viên thành công',
      members,
    };
  }

  async deleteMember(groupId: string, userId: string, memberId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc đã dừng hoạt động');
    }

    const isAdmin = await this.groupRepository.isAdmin(groupId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    const isOwner = await this.groupRepository.isOwner(groupId, memberId);
    if (isOwner) {
      throw new BadRequestException('Bạn không thể xóa chủ nhóm');
    }

    const targetIsAdmin = await this.groupRepository.isAdmin(groupId, memberId);
    const requesterIsOwner = await this.groupRepository.isOwner(groupId, userId);
    if (targetIsAdmin && !requesterIsOwner) {
      throw new ForbiddenException('Bạn không thể xóa admin khác');
    }

    await this.groupRepository.removeMember(groupId, memberId);
    return {
      message: 'Đã xóa thành công thành viên này khỏi nhóm',
    };
  }

  async changeRole(groupId: string, userId: string, memberId: string, changeRoleDto: ChangeRoleDto) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isOwner = await this.groupRepository.isOwner(groupId, userId);
    if (!isOwner) {
      throw new ForbiddenException('Chỉ người chủ nhóm mới được đổi role');
    }

    const targetMember = await this.groupRepository.getMembers(groupId);
    const member = targetMember.find((m) => m.userId === memberId);
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong nhóm');
    }

    if (userId === memberId) {
      throw new ForbiddenException('Bạn không thể hạ quyền chính mình');
    }

    await this.groupRepository.updateMemberRole(groupId, memberId, changeRoleDto.newRole);

    const updatedGroup = await this.groupRepository.findById(groupId);
    return {
      message: `Đã đổi role thành ${changeRoleDto.newRole}`,
      group: updatedGroup,
    };
  }
}

