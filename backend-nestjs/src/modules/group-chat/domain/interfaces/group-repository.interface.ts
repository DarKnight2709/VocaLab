import { MemberRole } from '@prisma/client';
import { GroupEntity } from '../group.entity';

export const IGROUP_REPOSITORY = 'IGROUP_REPOSITORY';

export interface UserBasicInfo {
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
}

export interface MemberWithUser {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user: UserBasicInfo;
}

export interface GroupWithDetails extends GroupEntity {
  owner: UserBasicInfo;
  members: MemberWithUser[];
  rolePermissions?: Array<{
    role: MemberRole;
    permission: { name: string };
  }>;
  messages?: any[]; // Tin nhắn cuối cùng nếu có
}

export interface IGroupRepository {
  create(data: {
    name: string;
    description?: string;
    avatar?: string;
    ownerId: string;
    members: Array<{ userId: string; role: MemberRole }>;
    rolePermissions?: Array<{ role: MemberRole; permissionId: string }>;
  }): Promise<GroupEntity>;

  findById(id: string): Promise<GroupWithDetails | null>;

  findByUserId(userId: string): Promise<GroupWithDetails[]>;

  update(id: string, data: Partial<GroupEntity>): Promise<GroupWithDetails>;

  delete(id: string): Promise<void>;

  addMember(groupId: string, userId: string, role?: MemberRole): Promise<MemberWithUser>;

  removeMember(groupId: string, userId: string): Promise<void>;

  updateMemberRole(groupId: string, userId: string, role: MemberRole): Promise<void>;

  getMembers(groupId: string): Promise<MemberWithUser[]>;

  isMember(groupId: string, userId: string): Promise<boolean>;

  isOwner(groupId: string, userId: string): Promise<boolean>;

  isHigherRole(groupId: string, userId: string, targetUserId: string): Promise<boolean>;

  isSameRole(groupId: string, userId: string, targetUserId: string): Promise<boolean>;

  transferOwnership(groupId: string, newOwnerId: string): Promise<void>;
}
