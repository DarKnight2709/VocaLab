import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class GroupMemberDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  groupId!: string;

  @ApiProperty()
  @Expose()
  userId!: string;

  @ApiProperty()
  @Expose()
  role!: MemberRole;

  @ApiProperty({ type: UserResponse })
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  permissions?: string[];

  @ApiProperty()
  @Expose()
  joinedAt!: Date;
}

export class RolePermissionDto {
  @ApiProperty()
  @Expose()
  role!: MemberRole;

  @ApiProperty()
  @Expose()
  permissionId!: string;

  @ApiProperty()
  @Expose()
  isEnabled!: boolean;
}
export class GroupDetailDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  languages!: string[];

  @ApiProperty({ type: [GroupMemberDto] })
  @Expose()
  @Type(() => GroupMemberDto)
  members!: GroupMemberDto[];

  @ApiProperty({ type: UserResponse })
  @Expose()
  @Type(() => UserResponse)
  owner!: UserResponse;

  @ApiProperty({ type: [RolePermissionDto] })
  @Expose()
  @Type(() => RolePermissionDto)
  rolePermissions!: RolePermissionDto[];
}

export class GroupSearchItemDto {
  @ApiProperty({ description: 'The unique identifier of the group' })
  @Expose()
  id!: string;

  @ApiProperty({ description: 'The name of the group' })
  @Expose()
  name!: string;

  @ApiProperty({ description: 'The description of the group' })
  @Expose()
  description!: string | null;

  @ApiProperty({ description: 'The creator of the group' })
  @Expose()
  owner!: UserResponse;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ type: [String], required: false })
  @Expose()
  languages?: string[];

  @ApiProperty({ type: [UserResponse] })
  @Expose()
  @Type(() => UserResponse)
  members!: {user: UserResponse}[];

  @ApiProperty({ description: 'The number of members in the group' })
  @Expose()
  _count!: { members: number };
}

export class GroupsSearchResultResponse {
  @ApiProperty({ type: [GroupSearchItemDto] })
  @Expose()
  @Type(() => GroupSearchItemDto)
  groups!: GroupSearchItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class PermissionDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  description!: string | null;
}
