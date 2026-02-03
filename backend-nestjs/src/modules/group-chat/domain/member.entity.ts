export class MemberEntity {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;

  constructor(partial: Partial<MemberEntity>) {
    Object.assign(this, partial);
  }
}

