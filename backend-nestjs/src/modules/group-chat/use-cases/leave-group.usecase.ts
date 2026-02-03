import { Injectable, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';

@Injectable()
export class LeaveGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository
  ) {}

  async execute(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new BadRequestException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    const isOwner = await this.groupRepository.isOwner(groupId, userId);
    if (isOwner) {
      // Deactivate group if owner leaves
      await this.groupRepository.delete(groupId);
      return { message: 'Xóa nhóm thành công' };
    }

    // Remove member
    await this.groupRepository.removeMember(groupId, userId);
    return { message: 'Rời nhóm thành công' };
  }
}

