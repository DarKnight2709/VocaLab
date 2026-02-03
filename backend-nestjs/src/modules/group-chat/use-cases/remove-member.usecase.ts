import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';

export interface RemoveMemberInput {
  groupId: string;
  userId: string;
  memberId: string;
}

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository
  ) {}

  async execute(input: RemoveMemberInput) {
    const { groupId, userId, memberId } = input;

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
    return { success: true };
  }
}
