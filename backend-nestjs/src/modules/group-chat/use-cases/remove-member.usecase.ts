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
} from '../domain/interfaces/group-repository.interface';
import { ErrorCode } from '@/common/enums/error-code.enum';

export interface RemoveMemberInput {
  groupId: string;
  userId: string;
  memberId: string;
}

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(input: RemoveMemberInput) {
    const { groupId, memberId } = input;

    const isTargetOwner = await this.groupRepository.isOwner(groupId, memberId);
    if (isTargetOwner) {
      throw new BadRequestException(ErrorCode.CANNOT_REMOVE_GROUP_OWNER);
    }

    await this.groupRepository.removeMember(groupId, memberId);
    return { success: true };
  }
}
