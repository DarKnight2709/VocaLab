import {
  Injectable,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import {
  type IGroupRepository,
  IGROUP_REPOSITORY,
} from '../domain/interfaces/group-repository.interface';
import { MemberRole } from '@prisma/client';
import { ErrorCode } from '@/common/enums/error-code.enum';

@Injectable()
export class JoinGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(groupId: string, userId: string) {
    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new BadRequestException(ErrorCode.GROUP_INACTIVE_OR_NOT_FOUND);
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (isMember) {
      throw new ConflictException(ErrorCode.ALREADY_GROUP_MEMBER);
    }

    await this.groupRepository.addMember(groupId, userId, MemberRole.MEMBER);
    return { message: 'Tham gia nhóm thành công' };
  }
}
