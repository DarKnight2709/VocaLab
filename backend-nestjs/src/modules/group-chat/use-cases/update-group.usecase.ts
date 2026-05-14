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
import { UpdateGroupDto } from '../dto/update-group.dto';
import { ErrorCode } from '@/common/enums/error-code.enum';

export interface UpdateGroupInput {
  groupId: string;
  userId: string;
  data: UpdateGroupDto;
}

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
  ) {}

  async execute(input: UpdateGroupInput): Promise<GroupWithDetails> {
    const { groupId, data } = input;

    const updateData: any = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name === '') {
        throw new BadRequestException(ErrorCode.GROUP_NAME_REQUIRED);
      }
      updateData.name = name;
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
