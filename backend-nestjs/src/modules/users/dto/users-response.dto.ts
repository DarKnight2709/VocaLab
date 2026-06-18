import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialPlatform, VoteType } from '@prisma/client';

// ─── Shared / Reusable DTOs ─────────────────────────────────

export class UserPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 12 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 9 })
  totalPages!: number;
}

export class UserSummaryDto {
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

  @ApiPropertyOptional({ example: true })
  isFollowing?: boolean;

  @ApiPropertyOptional({ example: true })
  canFollow?: boolean;
}

export class PublicUserDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: true })
  hasPassword?: boolean;
}

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

// export class UsersSearchResultResponse {
//   @ApiProperty({ type: [UserResponse] })
//   users!: UserResponse[];

//   @ApiProperty({ type: PaginationMetaDto })
//   meta!: PaginationMetaDto;
// }


// ─── Update Profile ─────────────────────────────────────────

export class UpdateProfileResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar!: string | null;
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

export class GetUserStatsResponseDto {
  @ApiProperty({ example: 10 })
  followers!: number;

  @ApiProperty({ example: 5 })
  following!: number;

  @ApiProperty({ example: 3 })
  friends!: number;

  @ApiProperty({ example: 12 })
  posts!: number;
}

export class GetByUsernameResponseDto {
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
  avatar?: string | null;

  @ApiPropertyOptional({ example: true })
  hasPassword?: boolean;

  @ApiProperty({ type: GetUserStatsResponseDto })
  stats!: GetUserStatsResponseDto;

  @ApiProperty({ example: true })
  isFollowing!: boolean;

  @ApiProperty({ example: true })
  isBlocking!: boolean;

  @ApiProperty({ type: UserCapabilitiesDto })
  capabilities!: UserCapabilitiesDto;
}

// ─── Search ─────────────────────────────────────────────────

export class SearchResponseDto {
  @ApiProperty({ type: [PublicUserDto] })
  users!: PublicUserDto[];

  @ApiProperty({ example: [], description: 'Group results (reserved)' })
  groups!: any[];
}

// ─── Get All Users ──────────────────────────────────────────

export class GetAllUsersResponseDto {
  @ApiProperty({ type: [PublicUserDto] })
  users!: PublicUserDto[];
}

// ─── Followers / Following / Friends ────────────────────────

export class GetFollowersResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  followers!: UserSummaryDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

export class GetFollowingResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  following!: UserSummaryDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

export class GetFriendsResponseDto {
  @ApiProperty({ type: [UserSummaryDto] })
  friends!: UserSummaryDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

export class BlockedUserDto {
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

export class GetBlockedUsersResponseDto {
  @ApiProperty({ type: [BlockedUserDto] })
  blockedUsers!: BlockedUserDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

// ─── User Posts ─────────────────────────────────────────────

export class UserPostItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...', nullable: true })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url', nullable: true })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: { comments: 5 } })
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  userVote!: VoteType | null;
}

export class GetUserPostsResponseDto {
  @ApiProperty({ type: [UserPostItemDto] })
  posts!: UserPostItemDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

// ─── Follow Status ──────────────────────────────────────────

export class CheckFollowStatusResponseDto {
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

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class DeleteSocialResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;
}
