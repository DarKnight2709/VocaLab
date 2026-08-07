import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class BlogAuthorDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  @Expose()
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  @Expose()
  fullName!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @Expose()
  avatar!: string | null;
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


export class BlogListItemDto {
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

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;

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

export class GetBlogsResponseDto {
  @ApiProperty({ type: [BlogListItemDto] })
  @Expose()
  @Type(() => BlogListItemDto)
  blogs!: BlogListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}


export class CommentTreeItemDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiPropertyOptional({ example: 'Bài viết rất hay!', nullable: true })
  @Expose()
  content!: string | null;

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

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', nullable: true })
  @Expose()
  deletedAt!: Date | null;

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;

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

export class BlogDetailDto {
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

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  @Expose()
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  @Expose()
  userVote!: VoteType | null;

  @ApiProperty({ type: [CommentTreeItemDto] })
  @Expose()
  @Type(() => CommentTreeItemDto)
  comments!: CommentTreeItemDto[];
}

export class GetBlogByIdResponseDto {
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

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  @Expose()
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  @Expose()
  userVote!: VoteType | null;

  @ApiProperty({ type: [CommentTreeItemDto] })
  @Expose()
  @Type(() => CommentTreeItemDto)
  comments!: CommentTreeItemDto[];
}

export class MyBlogListItemDto {
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

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  @Expose()
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: null, nullable: true })
  @Expose()
  userVote!: VoteType | null;
}

export class GetMyBlogsResponseDto {
  @ApiProperty({ type: [MyBlogListItemDto] })
  @Expose()
  @Type(() => MyBlogListItemDto)
  blogs!: MyBlogListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
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

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;
}

/** Blog đã cập nhật (trả về sau update) */
export class UpdateBlogResponseDto {
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

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  @Expose()
  _count!: { comments: number };
}


export class UpdateCommentResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Nội dung đã chỉnh sửa' })
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

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', nullable: true })
  @Expose()
  deletedAt!: Date | null;

  @ApiProperty({ type: BlogAuthorDto })
  @Expose()
  @Type(() => BlogAuthorDto)
  author!: BlogAuthorDto;
}

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

export class DeleteResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;
}
