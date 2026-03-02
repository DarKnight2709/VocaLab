import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY, GroupWithDetails } from '../domain/interfaces/group-repository.interface';
import { ChangeRoleDto } from '../dto/change-role.dto';

export interface ChangeRoleInput {
  groupId: string;
  userId: string;
  memberId: string;
  data: ChangeRoleDto;
}

@Injectable()
export class ChangeRoleUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository
  ) {}

  async execute(input: ChangeRoleInput): Promise<GroupWithDetails | null> {
    const { groupId, userId, memberId, data } = input;

    const targetMembers = await this.groupRepository.getMembers(groupId);
    const member = targetMembers.find((m) => m.userId === memberId);
    if (!member) {
      throw new NotFoundException('Thành viên không tồn tại trong nhóm');
    }

    if (userId === memberId) {
      throw new ForbiddenException('Bạn không thể tự hạ quyền chính mình');
    }

    await this.groupRepository.updateMemberRole(groupId, memberId, data.newRole);

    return this.groupRepository.findById(groupId);
  }
}
