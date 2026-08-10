import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
export class CreateGrammarResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Present Perfect Simple' })
  @Expose()
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  @Expose()
  structure!: string;

  @ApiProperty({ example: 'Dùng để diễn đạt hành động...' })
  @Expose()
  explanation!: string;

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    nullable: true,
  })
  @Expose()
  examples!: Prisma.JsonValue;

  @ApiPropertyOptional({ example: 'Thì hiện tại', nullable: true })
  @Expose()
  category!: string | null;

  @ApiPropertyOptional({ example: 'B1', nullable: true })
  @Expose()
  level!: string | null;

  @ApiProperty({ example: false })
  @Expose()
  isDefault!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  @Expose()
  authorId!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}

export class GrammarAuthorDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'quyentran' })
  @Expose()
  username!: string;

  @ApiProperty({ example: 'Trần Duy Quyến' })
  @Expose()
  fullName!: string;
}

export class GrammarItemDto extends CreateGrammarResponseDto{
  @ApiPropertyOptional({ type: GrammarAuthorDto, nullable: true })
  @Expose()
  @Type(() => GrammarAuthorDto)
  author!: GrammarAuthorDto | null;
}

export class GrammarsResponseDto {
  @ApiProperty({ type: [GrammarItemDto] })
  @Expose()
  @Type(() => GrammarItemDto)
  items!: GrammarItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class CategoriesResponseDto {
  @ApiProperty({ example: ['Thì hiện tại', 'Thì quá khứ', 'Câu điều kiện'] })
  @Expose()
  categories!: string[];
}