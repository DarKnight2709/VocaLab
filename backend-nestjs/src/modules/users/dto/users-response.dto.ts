import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto, BlogResponse } from '@/modules/blog/dto/blog-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialPlatform, VoteType } from '@prisma/client';

// ─── Shared / Reusable DTOs ─────────────────────────────────
export class UserResponse {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  @Expose()
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  @Expose()
  fullName!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  @Expose()
  avatar!: string | null;
}

export class UserSummaryDto extends UserResponse {
  @ApiPropertyOptional({ example: true })
  @Expose()
  isFollowing?: boolean;

  @ApiPropertyOptional({ example: true })
  @Expose()
  canFollow?: boolean;
}

export class PublicUserDto extends UserResponse {
  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email!: string;

  @ApiPropertyOptional({ example: true })
  @Expose()
  hasPassword?: boolean;
}

// ─── Update Profile ─────────────────────────────────────────

export class UpdateProfileResponseDto extends UserResponse {
  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email!: string;
}

// ─── Get By Username ────────────────────────────────────────

export class UserCapabilitiesDto {
  @ApiProperty({ example: true })
  @Expose()
  canFollow!: boolean;

  @ApiProperty({ example: false })
  @Expose()
  canChat!: boolean;

  @ApiProperty({ example: false })
  @Expose()
  canSeeFollowers!: boolean;

  @ApiProperty({ example: true })
  @Expose()
  canSeeFollowing!: boolean;

  @ApiProperty({ example: true })
  @Expose()
  canSeeFriends!: boolean;

  @ApiProperty({ example: true })
  @Expose()
  canSeeGroups!: boolean;
}

// ─── User Stats ─────────────────────────────────────────────

export class UserStatsResponseDto {
  @ApiProperty({ example: 10 })
  @Expose()
  followers!: number;

  @ApiProperty({ example: 5 })
  @Expose()
  following!: number;

  @ApiProperty({ example: 3 })
  @Expose()
  friends!: number;

  @ApiProperty({ example: 12 })
  @Expose()
  posts!: number;
}

export class UserDetailsDto extends UserResponse{
  @ApiPropertyOptional({ example: true })
  @Expose()
  hasPassword?: boolean;

  @ApiProperty({ type: UserStatsResponseDto })
  @Expose()
  @Type(() => UserStatsResponseDto)
  stats!: UserStatsResponseDto;

  @ApiProperty({ example: true })
  @Expose()
  isFollowing!: boolean;

  @ApiProperty({ example: true })
  @Expose()
  isBlocking!: boolean;

  @ApiProperty({ type: UserCapabilitiesDto })
  @Expose()
  @Type(() => UserCapabilitiesDto)
  capabilities!: UserCapabilitiesDto;

  @ApiProperty({ type: () => [UserSocialDto], required: false })
  @Expose()
  @Type(() => UserSocialDto)
  socials?: UserSocialDto[];
}

// ─── Followers / Following / Friends ────────────────────────
export class FollowersResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  @Expose()
  @Type(() => UserSummaryDto)
  followers!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class FollowingResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  @Expose()
  @Type(() => UserSummaryDto)
  following!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class FriendsResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  @Expose()
  @Type(() => UserSummaryDto)
  friends!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class FriendsSuggestionResponseDto {
  @ApiProperty({ type: [UserResponse] })
  @Expose()
  @Type(() => UserResponse)
  friends!: UserResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class BlockedUsersResponseDto {
  @ApiProperty({ type: [UserResponse] })
  @Expose()
  @Type(() => UserResponse)
  blockedUsers!: UserResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class UserCollectionCountDto {
  @ApiProperty({ example: 10 })
  @Expose()
  cards!: number;
}

export class UserCollectionItemDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'My Collection' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'A great collection', nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ type: UserSummaryDto })
  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;

  @ApiProperty({ type: UserCollectionCountDto })
  @Expose()
  @Type(() => UserCollectionCountDto)
  _count!: UserCollectionCountDto;
}

export class UserCollectionsResponseDto {
  @ApiProperty({ type: [UserCollectionItemDto] })
  @Expose()
  @Type(() => UserCollectionItemDto)
  collections!: UserCollectionItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class UserGroupCountDto {
  @ApiProperty({ example: 50 })
  @Expose()
  members!: number;
}

export class UserGroupMemberDto {
  @ApiProperty({ type: UserSummaryDto })
  @Expose()
  @Type(() => UserSummaryDto)
  user!: UserSummaryDto;
}

export class UserGroupItemDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Study Group' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Join us!', nullable: true })
  @Expose()
  description!: string | null;

  @ApiPropertyOptional({ example: 'https://avatar', nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ type: UserSummaryDto })
  @Expose()
  @Type(() => UserSummaryDto)
  owner!: UserSummaryDto;

  @ApiProperty({ type: UserGroupCountDto })
  @Expose()
  @Type(() => UserGroupCountDto)
  _count!: UserGroupCountDto;
  
  @ApiPropertyOptional({ type: [UserGroupMemberDto] })
  @Expose()
  @Type(() => UserGroupMemberDto)
  members!: UserGroupMemberDto[];
}

export class UserGroupsResponseDto {
  @ApiProperty({ type: [UserGroupItemDto] })
  @Expose()
  @Type(() => UserGroupItemDto)
  groups!: UserGroupItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

// ─── Follow Status ──────────────────────────────────────────

export class FollowStatusResponseDto {
  @ApiProperty({ example: true })
  @Expose()
  isFollowing!: boolean;
}

// ─── Follow / Unfollow ──────────────────────────────────────

export class FollowResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;
}

// ─── Social Links ───────────────────────────────────────────

export class UserSocialDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  userId!: string;

  @ApiProperty({ enum: SocialPlatform, example: 'FACEBOOK' })
  @Expose()
  platform!: SocialPlatform;

  @ApiPropertyOptional({ example: 'My Facebook', nullable: true })
  @Expose()
  name!: string | null;

  @ApiProperty({ example: 'https://facebook.com/myprofile' })
  @Expose()
  link!: string;
}

export class ProfileSearchResultResponse {
  @ApiProperty({ type: [UserSummaryDto] })
  @Expose()
  @Type(() => UserSummaryDto)
  profiles!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class UserChatInfoDto extends UserResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the current user can send messages to this user',
  })
  @Expose()
  canChat!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this user has blocked the current user',
  })
  @Expose()
  isBlocked!: boolean;
}

export class UserPostsResponseDto {
  @ApiProperty({ type: [BlogResponse] })
  @Expose()
  @Type(() => BlogResponse)
  posts!: BlogResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}