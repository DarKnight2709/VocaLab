import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { PrismaService } from '../../../core/database/prisma.service';
import { AddMemberDto } from '../dto/add-member.dto';

export interface AddMemberInput {
  groupId: string;
  userId: string;
  data: AddMemberDto;
}

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
    private prisma: PrismaService,
  ) {}

  async execute(input: AddMemberInput) {
    const { groupId, userId, data } = input;

    const group = await this.groupRepository.findById(groupId);
    if (!group || !group.isActive) {
      throw new NotFoundException('Nhóm không tồn tại hoặc không còn hoạt động');
    }

    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên nhóm này');
    }

    // Validate member IDs
    const existingUsers = await this.prisma.user.findMany({
      where: { id: { in: data.memberIds } },
      select: { id: true },
    });

    if (existingUsers.length !== data.memberIds.length) {
      throw new BadRequestException('Một số thành viên không tồn tại');
    }

    const newMembers: string[] = [];
    const existingMembers: string[] = [];

    for (const memberId of data.memberIds) {
      const alreadyMember = await this.groupRepository.isMember(groupId, memberId);
      if (alreadyMember) {
        existingMembers.push(memberId);
      } else {
        newMembers.push(memberId);
      }
    }

    if (existingMembers.length === data.memberIds.length) {
      throw new BadRequestException('Tất cả thành viên đã có sẵn trong nhóm');
    }

    // Add new members
    for (const memberId of newMembers) {
      await this.groupRepository.addMember(groupId, memberId, 'member');
    }

    return {
      existingMembers,
      newMembers,
    };
  }
}
