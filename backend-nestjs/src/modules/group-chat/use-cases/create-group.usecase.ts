import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IGroupRepository, IGROUP_REPOSITORY } from '../domain/interfaces/group-repository.interface';
import { PrismaService } from '../../../core/database/prisma.service';

export interface CreateGroupInput {
  ownerId: string;
  name: string;
  description?: string;
  memberIds: string[];
}

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject(IGROUP_REPOSITORY)
    private groupRepository: IGroupRepository,
    private prisma: PrismaService,
  ) {}

  async execute(input: CreateGroupInput) {
    // Validate member IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: { in: input.memberIds },
      },
      select: { id: true },
    });

    if (existingUsers.length !== input.memberIds.length) {
      throw new BadRequestException('Một số thành viên không tồn tại!');
    }

    // Create members array with owner as admin
    const members = [
      { userId: input.ownerId, role: 'admin' },
      ...input.memberIds
        .filter((id) => id !== input.ownerId)
        .map((id) => ({ userId: id, role: 'member' })),
    ];

    const group = await this.groupRepository.create({
      name: input.name.trim(),
      description: input.description?.trim(),
      ownerId: input.ownerId,
      members,
    });

    return group;
  }
}

