import { GroupEntity } from '../group.entity';

export const IGROUP_REPOSITORY = 'IGROUP_REPOSITORY';

export interface IGroupRepository {
  create(data: {
    name: string;
    description?: string;
    avatar?: string;
    ownerId: string;
    members: Array<{ userId: string; role: string }>;
  }): Promise<GroupEntity>;

  findById(id: string): Promise<any>; // Using any for now as Prisma returns complex types

  findByUserId(userId: string): Promise<any[]>;

  update(id: string, data: Partial<GroupEntity>): Promise<any>;

  delete(id: string): Promise<any>;

  addMember(groupId: string, userId: string, role?: string): Promise<any>;

  removeMember(groupId: string, userId: string): Promise<any>;

  updateMemberRole(groupId: string, userId: string, role: string): Promise<any>;

  getMembers(groupId: string): Promise<any[]>;

  isMember(groupId: string, userId: string): Promise<boolean>;

  isAdmin(groupId: string, userId: string): Promise<boolean>;

  isOwner(groupId: string, userId: string): Promise<boolean>;
}
