export class GroupEntity {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  members?: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<GroupEntity>) {
    Object.assign(this, partial);
  }
}

