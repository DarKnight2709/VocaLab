import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class BlogAuthorDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar!: string | null;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}


export class BlogListItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  userVote!: VoteType | null;
}

export class GetBlogsResponseDto {
  @ApiProperty({ type: [BlogListItemDto] })
  blogs!: BlogListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}


export class CommentTreeItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiPropertyOptional({ example: 'Bài viết rất hay!', nullable: true })
  content!: string | null;

  @ApiProperty({ example: 'uuid-string' })
  blogId!: string;

  @ApiProperty({ example: 'uuid-string' })
  authorId!: string;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  parentCommentId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;

  @ApiProperty({ example: 2 })
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  userVote!: VoteType | null;

  @ApiProperty({ type: () => [CommentTreeItemDto] })
  replies!: CommentTreeItemDto[];
}

export class BlogDetailDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  userVote!: VoteType | null;

  @ApiProperty({ type: [CommentTreeItemDto] })
  comments!: CommentTreeItemDto[];
}

export class GetBlogByIdResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  _count!: { comments: number };

  @ApiProperty({ example: 3 })
  voteScore!: number;

  @ApiPropertyOptional({ enum: VoteType, example: 'UPVOTE', nullable: true })
  userVote!: VoteType | null;

  @ApiProperty({ type: [CommentTreeItemDto] })
  comments!: CommentTreeItemDto[];
}

export class MyBlogListItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
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

  @ApiPropertyOptional({ enum: VoteType, example: null, nullable: true })
  userVote!: VoteType | null;
}

export class GetMyBlogsResponseDto {
  @ApiProperty({ type: [MyBlogListItemDto] })
  blogs!: MyBlogListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}


export class CreateBlogResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;
}

/** Blog đã cập nhật (trả về sau update) */
export class UpdateBlogResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Cách dùng Present Perfect' })
  title!: string;

  @ApiProperty({ example: '<p>Nội dung bài viết...</p>' })
  content!: string;

  @ApiPropertyOptional({ example: 'Tóm tắt ngắn...' })
  excerpt!: string | null;

  @ApiPropertyOptional({ example: 'https://image.url' })
  coverImage!: string | null;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;

  @ApiProperty({ example: { comments: 5 } })
  _count!: { comments: number };
}


export class UpdateCommentResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Nội dung đã chỉnh sửa' })
  content!: string;

  @ApiProperty({ example: 'uuid-string' })
  blogId!: string;

  @ApiProperty({ example: 'uuid-string' })
  authorId!: string;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  parentCommentId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', nullable: true })
  deletedAt!: Date | null;

  @ApiProperty({ type: BlogAuthorDto })
  author!: BlogAuthorDto;
}

export class CreateCommentResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Bài viết rất hay!' })
  content!: string;

  @ApiProperty({ example: 'uuid-string' })
  blogId!: string;

  @ApiProperty({ example: 'uuid-string' })
  authorId!: string;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  parentCommentId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt!: Date | null;
}

export class DeleteResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;
}
