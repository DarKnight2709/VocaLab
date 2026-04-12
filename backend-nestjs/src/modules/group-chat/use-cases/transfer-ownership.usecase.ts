import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  type IGroupRepository,
  IGROUP_REPOSITORY,
} from '../domain/interfaces/group-repository.interface';

@Injectable()
export class TransferOwnershipUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(
    groupId: string,
    currentOwnerId: string,
    newOwnerId: string,
  ) {
    // Verify current user is the owner
    const isOwner = await this.groupRepository.isOwner(
      groupId,
      currentOwnerId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'Chỉ chủ nhóm mới có thể chuyển quyền sở hữu',
      );
    }

    // Verify new owner is a member
    const isMember = await this.groupRepository.isMember(
      groupId,
      newOwnerId,
    );

    if (!isMember) {
      throw new BadRequestException(
        'Người nhận quyền sở hữu phải là thành viên của nhóm',
      );
    }

    // Transfer ownership
    await this.groupRepository.transferOwnership(
      groupId,
      newOwnerId,
    );

    return {
      message: 'Chuyển quyền sở hữu thành công',
    };
  }
}