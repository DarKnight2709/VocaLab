import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

// ─── Shared / Reusable DTOs ─────────────────────────────────

export class GrammarAuthorDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  fullName!: string;
}

export class GrammarPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

// ─── Grammar List Item (for getAll) ─────────────────────────

export class GrammarListItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Present Perfect Simple' })
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  structure!: string;

  @ApiProperty({ example: 'Dùng để diễn đạt hành động đã xảy ra trong quá khứ nhưng còn liên quan đến hiện tại' })
  explanation!: string;

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    nullable: true,
  })
  examples!: Prisma.JsonValue;

  @ApiPropertyOptional({ example: 'Thì hiện tại', nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ example: 'B1', nullable: true })
  level!: string | null;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: GrammarAuthorDto, nullable: true })
  author!: GrammarAuthorDto | null;
}

export class GetGrammarsResponseDto {
  @ApiProperty({ type: [GrammarListItemDto] })
  items!: GrammarListItemDto[];

  @ApiProperty({ type: GrammarPaginationMetaDto })
  meta!: GrammarPaginationMetaDto;
}

// ─── Categories ─────────────────────────────────────────────

export class GetCategoriesResponseDto {
  @ApiProperty({ example: ['Thì hiện tại', 'Thì quá khứ', 'Câu điều kiện'] })
  categories!: string[];
}

// ─── Grammar Detail (for getById) ───────────────────────────

export class GetGrammarByIdResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Present Perfect Simple' })
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  structure!: string;

  @ApiProperty({ example: 'Dùng để diễn đạt hành động đã xảy ra trong quá khứ nhưng còn liên quan đến hiện tại' })
  explanation!: string;

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    nullable: true,
  })
  examples!: Prisma.JsonValue;

  @ApiPropertyOptional({ example: 'Thì hiện tại', nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ example: 'B1', nullable: true })
  level!: string | null;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: GrammarAuthorDto, nullable: true })
  author!: GrammarAuthorDto | null;
}

// ─── Create Grammar Response ────────────────────────────────

export class CreateGrammarResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Present Perfect Simple' })
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  structure!: string;

  @ApiProperty({ example: 'Dùng để diễn đạt hành động...' })
  explanation!: string;

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    nullable: true,
  })
  examples!: Prisma.JsonValue;

  @ApiPropertyOptional({ example: 'Thì hiện tại', nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ example: 'B1', nullable: true })
  level!: string | null;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

// ─── Update Grammar Response ────────────────────────────────

export class UpdateGrammarResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Present Perfect Simple' })
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  structure!: string;

  @ApiProperty({ example: 'Dùng để diễn đạt hành động...' })
  explanation!: string;

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    nullable: true,
  })
  examples!: Prisma.JsonValue;

  @ApiPropertyOptional({ example: 'Thì hiện tại', nullable: true })
  category!: string | null;

  @ApiPropertyOptional({ example: 'B1', nullable: true })
  level!: string | null;

  @ApiProperty({ example: false })
  isDefault!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  authorId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

// ─── Delete Response ────────────────────────────────────────

export class DeleteGrammarResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;
}
