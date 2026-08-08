import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
export class CreateCommentResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Bài viết rất hay!' })
  @Expose()
  content!: string;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  blogId!: string;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  authorId!: string;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  @Expose()
  parentCommentId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  @Expose()
  deletedAt!: Date | null;
}

export class UpdateCommentResponseDto extends CreateCommentResponseDto {
  @ApiProperty({ type: () => UserResponse })
  @Expose()
  @Type(() => UserResponse)
  author!: UserResponse;
}
export class CommentTreeItemDto extends CreateCommentResponseDto {
  @ApiProperty({ type: () => UserResponse })
  @Expose()
  @Type(() => UserResponse)
  author!: UserResponse;

  @ApiProperty({ example: 2 })
  @Expose()
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  @Expose()
  userVote!: VoteType | null;

  @ApiProperty({ type: () => [CommentTreeItemDto] })
  @Expose()
  @Type(() => CommentTreeItemDto)
  replies!: CommentTreeItemDto[];
}

export class BlogResponse {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  @Expose()
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  @Expose()
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  @Expose()
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  @Expose()
  coverImage!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({ type: () => UserResponse })
  @Expose()
  @Type(() => UserResponse)
  author!: UserResponse;

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  @Expose()
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  @Expose()
  userVote!: VoteType | null;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  @Expose()
  page!: number;

  @ApiProperty({ example: 10 })
  @Expose()
  limit!: number;

  @ApiProperty({ example: 100 })
  @Expose()
  total!: number;

  @ApiProperty({ example: 10 })
  @Expose()
  totalPages!: number;
}
export class BlogsResponseDto {
  @ApiProperty({ type: [BlogResponse] })
  @Expose()
  @Type(() => BlogResponse)
  posts!: BlogResponse[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class BlogDetailDto extends BlogResponse {
  @ApiProperty({ type: [CommentTreeItemDto] })
  @Expose()
  @Type(() => CommentTreeItemDto)
  comments!: CommentTreeItemDto[];
}

export class CreateBlogResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  @Expose()
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  @Expose()
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  @Expose()
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  @Expose()
  coverImage!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({ type: () => UserResponse })
  @Expose()
  @Type(() => UserResponse)
  author!: UserResponse;

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };
}

