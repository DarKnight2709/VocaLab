import { Injectable, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';

@Injectable()
export class LeaveGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository
  ) {}

  async execute(groupId: string, userId: string) {
    // Logic: Nếu là Owner thì giải tán nhóm, nếu là Member thì chỉ rời nhóm
    const isOwner = await this.groupRepository.isOwner(groupId, userId);
    
    if (isOwner) {
      await this.groupRepository.delete(groupId);
      return { message: 'Giải tán nhóm thành công' };
    }

    await this.groupRepository.removeMember(groupId, userId);
    return { message: 'Rời nhóm thành công' };
  }
}

