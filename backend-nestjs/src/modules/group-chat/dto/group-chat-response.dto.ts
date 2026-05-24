import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class GroupMemberUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ required: false, nullable: true })
  avatar!: string | null;
}

export class GroupMemberDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  role!: MemberRole;

  @ApiProperty({ type: GroupMemberUserDto })
  user!: GroupMemberUserDto;

  @ApiProperty({ type: [String], required: false })
  permissions?: string[];

  @ApiProperty()
  joinedAt!: Date;
}

export class RolePermissionDto {
  @ApiProperty()
  role!: MemberRole;

  @ApiProperty()
  permissionId!: string;

  @ApiProperty()
  isEnabled!: boolean;
}

export class GroupDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatar!: string | null;

  @ApiProperty({ type: [GroupMemberDto] })
  members!: GroupMemberDto[];

  @ApiProperty({ type: GroupMemberUserDto })
  owner!: GroupMemberUserDto;

  @ApiProperty({ type: [RolePermissionDto] })
  rolePermissions!: RolePermissionDto[];
}

export class GetGroupsResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  avatar!: string | null;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty()
  unreadCount!: number;

  @ApiProperty()
  lastMessage!: any;

  @ApiProperty({ type: [String] })
  members!: string[];

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateGroupResponseDto extends GroupDetailDto {}
export class GetMembersResponseDto {
  @ApiProperty({ type: [GroupMemberDto] })
  members!: GroupMemberDto[];
}

export class PermissionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;
}
