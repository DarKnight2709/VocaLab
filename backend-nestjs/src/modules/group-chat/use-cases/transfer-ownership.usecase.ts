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
import { ErrorCode } from '@/common/enums/error-code.enum';

@Injectable()
export class TransferOwnershipUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(groupId: string, currentOwnerId: string, newOwnerId: string) {
    // Verify current user is the owner
    const isOwner = await this.groupRepository.isOwner(groupId, currentOwnerId);

    if (!isOwner) {
      throw new ForbiddenException(ErrorCode.ONLY_OWNER_CAN_TRANSFER_OWNERSHIP);
    }

    // Verify new owner is a member
    const isMember = await this.groupRepository.isMember(groupId, newOwnerId);

    if (!isMember) {
      throw new BadRequestException(ErrorCode.NEW_OWNER_MUST_BE_MEMBER);
    }

    // Transfer ownership
    await this.groupRepository.transferOwnership(groupId, newOwnerId);

    return {
      message: 'Chuyển quyền sở hữu thành công',
    };
  }
}
