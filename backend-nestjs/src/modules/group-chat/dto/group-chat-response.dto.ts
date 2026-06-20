import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
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

  @ApiProperty()
  isPublic!: boolean;

  @ApiProperty({ type: [GroupMemberDto] })
  members!: GroupMemberDto[];

  @ApiProperty({ type: GroupMemberUserDto })
  owner!: GroupMemberUserDto;

  @ApiProperty({ type: [RolePermissionDto] })
  rolePermissions!: RolePermissionDto[];
}

export class GroupSearchItemDto {
  @ApiProperty({ description: 'The unique identifier of the group' })
  id!: string;

  @ApiProperty({ description: 'The name of the group' })
  name!: string;

  @ApiProperty({ description: 'The description of the group' })
  description!: string | null;

  @ApiProperty({ description: 'The creator of the group' })
  owner!: UserResponse;

  @ApiProperty()
  isPublic!: boolean;

  @ApiProperty({ type: [UserResponse] })
  members!: {user: UserResponse}[];

  @ApiProperty({ description: 'The number of members in the group' })
  _count!: { members: number };
}

export class GroupsSearchResultResponse {
  @ApiProperty({ type: [GroupSearchItemDto] })
  groups!: GroupSearchItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
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
