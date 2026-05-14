import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import {
  type IGroupRepository,
  IGROUP_REPOSITORY,
} from '../domain/interfaces/group-repository.interface';
import { ErrorCode } from '@/common/enums/error-code.enum';

@Injectable()
export class LeaveGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(groupId: string, userId: string) {
    // Logic: Nếu là Owner thì giải tán nhóm, nếu là Member thì chỉ rời nhóm
    const isOwner = await this.groupRepository.isOwner(groupId, userId);

    if (isOwner) {
      // trao quyền owner cho người khác
      throw new ForbiddenException(ErrorCode.OWNER_CANNOT_LEAVE_GROUP);
    }

    await this.groupRepository.removeMember(groupId, userId);
    return { message: 'Rời nhóm thành công' };
  }
}
