import { Injectable, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';

@Injectable()
export class JoinGroupUseCase {
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
    if (isMember) {
      throw new ConflictException('Bạn đã là thành viên của nhóm này');
    }

    await this.groupRepository.addMember(groupId, userId, 'member');
    return { message: 'Tham gia nhóm thành công' };
  }
}

