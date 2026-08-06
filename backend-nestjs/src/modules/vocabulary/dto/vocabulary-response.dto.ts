import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardSide } from '@prisma/client';

// ─── Card field / Card field value ────────────────────────────────────────────
export class CardFieldResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'word' })
  key!: string;

  @ApiProperty({ example: 'Từ vựng' })
  label!: string;

  @ApiProperty({ enum: CardSide, example: 'FRONT' })
  side!: CardSide;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiPropertyOptional({ example: '#ff0000', nullable: true })
  color!: string | null;

  @ApiPropertyOptional({ example: 16, nullable: true })
  fontSize!: number | null;
}

export class CardFieldValueResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'uuid-string' })
  fieldId!: string;

  @ApiProperty({ example: 'Hello' })
  value!: string;

  @ApiPropertyOptional({ type: CardFieldResponseDto })
  field?: CardFieldResponseDto;
}

// ─── Collections ────────────────────────────────────────────

export class OriginUserDto {
  @ApiProperty({ example: 'johndoe' })
  username!: string;
}

export class CollectionOriginDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Original name' })
  name!: string;

  @ApiProperty({ type: OriginUserDto })
  user!: OriginUserDto;
}

export class CollectionItemDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Bộ từ IELTS' })
  name!: string;

  @ApiPropertyOptional({ example: 'Mô tả bộ từ vựng', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'uuid-string' })
  userId!: string;

  @ApiProperty({ example: true })
  isPublic!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  originId!: string | null;

  @ApiPropertyOptional({ type: CollectionOriginDto, nullable: true })
  origin!: CollectionOriginDto | null;

  @ApiProperty({ example: { cards: 25 } })
  _count!: { cards: number };
}

export class CollectionSearchItemDto extends CollectionItemDto {
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class CollectionSearchResponseDto {
  @ApiProperty({ type: [CollectionSearchItemDto] })
  collections!: CollectionSearchItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class CardTypeWithFieldsDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Vocabulary' })
  name!: string;

  @ApiPropertyOptional({ example: 'Kiểu thẻ từ vựng cơ bản', nullable: true })
  description!: string | null;

  @ApiProperty({ type: [CardFieldResponseDto] })
  fields!: CardFieldResponseDto[];
}

export class CardDetailDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  position!: number | null;

  @ApiProperty({ example: 0 })
  repetitions!: number;

  @ApiProperty({ example: 0 })
  interval!: number;

  @ApiProperty({ example: 2.5 })
  easeFactor!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  nextReviewDate!: Date;

  @ApiProperty({ type: CardTypeWithFieldsDto })
  cardType!: CardTypeWithFieldsDto;

  @ApiProperty({ type: [CardFieldValueResponseDto] })
  values!: CardFieldValueResponseDto[];
}

export class PublicCollectionResponseDto extends CollectionItemDto{
  @ApiProperty({ type: UserResponse })
  user!: UserResponse;

  @ApiProperty({ type: [CardDetailDto] })
  cards!: CardDetailDto[];
}

export class CollectionByIdResponseDto extends PublicCollectionResponseDto {
  @ApiProperty({ example: 5 })
  newCount!: number;

  @ApiProperty({ example: 10 })
  dueCount!: number;

  @ApiProperty({ example: 25 })
  totalCount!: number;
}

export class CreateCollectionResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'Bộ từ IELTS' })
  name!: string;

  @ApiPropertyOptional({ example: 'Mô tả bộ từ vựng', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'uuid-string' })
  userId!: string;

  @ApiProperty({ example: true })
  isPublic!: boolean;
}

export class ForkCollectionResponseDto extends CreateCollectionResponseDto {
  @ApiProperty({ type: [String], example: ['hello', 'world'] })
  createdCards!: string[];

  @ApiProperty({ type: [String], example: ['existing'] })
  updatedCards!: string[];

  @ApiProperty({ type: [String], example: ['skipped'] })
  skippedCards!: string[];
}

// ─── Import ─────────────────────────────────────────────────

export class ImportCountDetailDto {
  @ApiProperty({ example: 5 })
  count!: number;

  @ApiProperty({ example: ['hello\tworld'] })
  cards!: string[];
}

export class ImportErrorDetailDto {
  @ApiProperty({ example: 0 })
  count!: number;

  @ApiProperty({ example: [] })
  lines!: string[];
}

export class ImportCardsResponseDto {
  @ApiProperty({ type: ImportCountDetailDto })
  imported!: ImportCountDetailDto;

  @ApiProperty({ type: ImportCountDetailDto })
  skipped!: ImportCountDetailDto;

  @ApiProperty({ type: ImportCountDetailDto })
  updated!: ImportCountDetailDto;

  @ApiProperty({ type: ImportErrorDetailDto })
  errors!: ImportErrorDetailDto;
}

// ─── Card Types ─────────────────────────────────────────────

export class CardTypesResponseDto {
  @ApiProperty({ type: [CardTypeWithFieldsDto] })
  cardTypes!: CardTypeWithFieldsDto[];
}

export class ReviewCardResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 1 })
  repetitions!: number;

  @ApiProperty({ example: 6 })
  interval!: number;

  @ApiProperty({ example: 2.5 })
  easeFactor!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  nextReviewDate!: Date;
}
