export class GroupEntity {
  id!: string;
  name!: string;
  avatar?: string | null;
  description?: string | null;
  ownerId!: string;
  isActive!: boolean;
  members?: any[]; // Keep flexible for now, will be specified in Detailed interfaces
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<GroupEntity>) {
    Object.assign(this, partial);
  }
}

