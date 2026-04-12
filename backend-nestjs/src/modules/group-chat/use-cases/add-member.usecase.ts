import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { type IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { PrismaService } from '../../../core/database/prisma.service';
import { AddMemberDto } from '../dto/add-member.dto';
import { MemberRole } from '@prisma/client';

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

  async execute(input: AddMemberInput): Promise<{
    existingMembers: string[];
    newMembers: string[];
  }> {
    const { groupId, data } = input;

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
      await this.groupRepository.addMember(groupId, memberId, MemberRole.MEMBER);
    }

    return {
      existingMembers,
      newMembers,
    };
  }
}
