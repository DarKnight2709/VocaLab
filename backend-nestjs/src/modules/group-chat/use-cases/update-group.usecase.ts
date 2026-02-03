import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { UpdateGroupDto } from '../dto/update-group.dto';

export interface UpdateGroupInput {
  groupId: string;
  userId: string;
  data: UpdateGroupDto;
}

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository
  ) {}

  async execute(input: UpdateGroupInput) {
    const { groupId, userId, data } = input;

    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên nhóm này');
    }

    const isAdmin = await this.groupRepository.isAdmin(groupId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Chỉ admin được thay đổi thông tin nhóm');
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (data.name.trim() === '') {
        throw new BadRequestException('Tên nhóm không được để trống');
      }
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }

    const updated = await this.groupRepository.update(groupId, updateData);
    return updated;
  }
}
