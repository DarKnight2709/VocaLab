import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import {
  IGroupRepository,
  IGROUP_REPOSITORY,
} from '../domain/interfaces/group-repository.interface';

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(groupId: string, userId: string) {
    const isOwner = await this.groupRepository.isOwner(groupId, userId);

    if (!isOwner) {
      throw new ForbiddenException('Chỉ chủ nhóm mới có thể xóa nhóm');
    }
    await this.groupRepository.delete(groupId);
    return { message: 'Xóa nhóm thành công'}
  }
}
