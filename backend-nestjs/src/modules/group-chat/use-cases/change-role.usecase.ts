import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  type IGroupRepository,
  IGROUP_REPOSITORY,
  GroupWithDetails,
} from '../domain/interfaces/group-repository.interface';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';

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
    private groupRepository: IGroupRepository,
  ) {}

  async execute(input: ChangeRoleInput): Promise<GroupWithDetails | null> {
    const { groupId, userId, memberId, data } = input;

    // không cho phép thay đổi role của owner
    const isTargetOwner = await this.groupRepository.isOwner(groupId, memberId);
    if (isTargetOwner) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_GROUP_OWNER_ROLE);
    }

    // không cho phép thay đổi role của chính mình
    if (userId === memberId) {
      throw new ForbiddenException(ErrorCode.CANNOT_DEMOTE_SELF);
    }

    // không cho phép thay đổi role của cấp cao hơn
    const isTargetHigherRole = await this.groupRepository.isHigherRole(
      groupId,
      userId,
      memberId,
    );
    if (isTargetHigherRole) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_HIGHER_ROLE);
    }

    // không cho phép thay đổi role cùng cấp
    const isTargetSameRole = await this.groupRepository.isSameRole(
      groupId,
      userId,
      memberId,
    );
    if (isTargetSameRole) {
      throw new BadRequestException(ErrorCode.CANNOT_CHANGE_SAME_LEVEL_ROLE);
    }

    await this.groupRepository.updateMemberRole(
      groupId,
      memberId,
      data.newRole,
    );

    return this.groupRepository.findById(groupId);
  }
}
