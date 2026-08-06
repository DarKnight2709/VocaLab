import { MyBlogListItemDto, PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialPlatform, VoteType } from '@prisma/client';

// ─── Shared / Reusable DTOs ─────────────────────────────────
export class UserResponse {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar!: string | null;
}

export class UserSummaryDto extends UserResponse {
  @ApiPropertyOptional({ example: true })
  isFollowing?: boolean;

  @ApiPropertyOptional({ example: true })
  canFollow?: boolean;
}

export class PublicUserDto extends UserResponse {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: true })
  hasPassword?: boolean;
}

// ─── Update Profile ─────────────────────────────────────────

export class UpdateProfileResponseDto extends UserResponse {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;
}

// ─── Get By Username ────────────────────────────────────────

export class UserCapabilitiesDto {
  @ApiProperty({ example: true })
  canFollow!: boolean;

  @ApiProperty({ example: false })
  canChat!: boolean;

  @ApiProperty({ example: false })
  canSeeFollowers!: boolean;

  @ApiProperty({ example: true })
  canSeeFollowing!: boolean;

  @ApiProperty({ example: true })
  canSeeFriends!: boolean;
}

// ─── User Stats ─────────────────────────────────────────────

export class UserStatsResponseDto {
  @ApiProperty({ example: 10 })
  followers!: number;

  @ApiProperty({ example: 5 })
  following!: number;

  @ApiProperty({ example: 3 })
  friends!: number;

  @ApiProperty({ example: 12 })
  posts!: number;
}

export class UserDetailsDto extends UserResponse{
  @ApiPropertyOptional({ example: true })
  hasPassword?: boolean;

  @ApiProperty({ type: UserStatsResponseDto })
  stats!: UserStatsResponseDto;

  @ApiProperty({ example: true })
  isFollowing!: boolean;

  @ApiProperty({ example: true })
  isBlocking!: boolean;

  @ApiProperty({ type: UserCapabilitiesDto })
  capabilities!: UserCapabilitiesDto;

  @ApiProperty({ type: () => [UserSocialDto], required: false })
  socials?: UserSocialDto[];
}

// ─── Followers / Following / Friends ────────────────────────
export class FollowersResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  followers!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class FollowingResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  following!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class FriendsResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  friends!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class FriendsSuggestionResponseDto {
  @ApiProperty({ type: [UserResponse] })
  friends!: UserResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class BlockedUsersResponseDto {
  @ApiProperty({ type: [UserResponse] })
  blockedUsers!: UserResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class UserPostsResponseDto {
  @ApiProperty({ type: [MyBlogListItemDto] })
  posts!: MyBlogListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class UserCollectionCountDto {
  @ApiProperty({ example: 10 })
  cards!: number;
}

export class UserCollectionItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'My Collection' })
  name!: string;

  @ApiPropertyOptional({ example: 'A great collection', nullable: true })
  description!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ type: UserSummaryDto })
  user!: UserSummaryDto;

  @ApiProperty({ type: UserCollectionCountDto })
  _count!: UserCollectionCountDto;
}

export class UserCollectionsResponseDto {
  @ApiProperty({ type: [UserCollectionItemDto] })
  collections!: UserCollectionItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class UserGroupCountDto {
  @ApiProperty({ example: 50 })
  members!: number;
}

export class UserGroupMemberDto {
  @ApiProperty({ type: UserSummaryDto })
  user!: UserSummaryDto;
}

export class UserGroupItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Study Group' })
  name!: string;

  @ApiPropertyOptional({ example: 'Join us!', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ example: 'https://avatar', nullable: true })
  avatar!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ type: UserSummaryDto })
  owner!: UserSummaryDto;

  @ApiProperty({ type: UserGroupCountDto })
  _count!: UserGroupCountDto;
  
  @ApiPropertyOptional({ type: [UserGroupMemberDto] })
  members!: UserGroupMemberDto[];
}

export class UserGroupsResponseDto {
  @ApiProperty({ type: [UserGroupItemDto] })
  groups!: UserGroupItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

// ─── Follow Status ──────────────────────────────────────────

export class FollowStatusResponseDto {
  @ApiProperty({ example: true })
  isFollowing!: boolean;
}

// ─── Follow / Unfollow ──────────────────────────────────────

export class FollowResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;
}

// ─── Social Links ───────────────────────────────────────────

export class UserSocialDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'uuid-string' })
  userId!: string;

  @ApiProperty({ enum: SocialPlatform, example: 'FACEBOOK' })
  platform!: SocialPlatform;

  @ApiPropertyOptional({ example: 'My Facebook', nullable: true })
  name!: string | null;

  @ApiProperty({ example: 'https://facebook.com/myprofile' })
  link!: string;
}

export class ProfileSearchResultResponse {
  @ApiProperty({ type: [UserSummaryDto] })
  profiles!: UserSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class UserChatInfoDto extends UserResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the current user can send messages to this user',
  })
  canChat!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this user has blocked the current user',
  })
  isBlocked!: boolean;
}