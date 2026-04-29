import { MemberRole } from '@prisma/client';

export class MemberEntity {
  id!: string;
  groupId!: string;
  userId!: string;
  role!: MemberRole;
  joinedAt!: Date;

  constructor(partial: Partial<MemberEntity>) {
    Object.assign(this, partial);
  }
}

