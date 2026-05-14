import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import {
  type IGroupRepository,
  IGROUP_REPOSITORY,
} from '../domain/interfaces/group-repository.interface';
import { ErrorCode } from '@/common/enums/error-code.enum';

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(groupId: string, userId: string) {
    const isOwner = await this.groupRepository.isOwner(groupId, userId);

    if (!isOwner) {
      throw new ForbiddenException(ErrorCode.ONLY_GROUP_OWNER_CAN_DELETE);
    }
    await this.groupRepository.delete(groupId);
    return { message: 'Xóa nhóm thành công' };
  }
}
