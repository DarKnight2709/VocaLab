import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardSide } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

// ─── Card field / Card field value ────────────────────────────────────────────
export class CardFieldResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'word' })
  @Expose()
  key!: string;

  @ApiProperty({ example: 'Từ vựng' })
  @Expose()
  label!: string;

  @ApiProperty({ enum: CardSide, example: 'FRONT' })
  @Expose()
  side!: CardSide;

  @ApiProperty({ example: 0 })
  @Expose()
  order!: number;

  @ApiPropertyOptional({ example: '#ff0000', nullable: true })
  @Expose()
  color!: string | null;

  @ApiPropertyOptional({ example: 16, nullable: true })
  @Expose()
  fontSize!: number | null;
}

export class CardFieldValueResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  fieldId!: string;

  @ApiProperty({ example: 'Hello' })
  @Expose()
  value!: string;

  @ApiPropertyOptional({ type: CardFieldResponseDto })
  @Expose()
  @Type(() => CardFieldResponseDto)
  field?: CardFieldResponseDto;
}

// ─── Collections ────────────────────────────────────────────
export class CollectionInfo {
  @ApiProperty({ example: 'uuid-string' })
 @Expose()
  id!: string;

  @ApiProperty({ example: 'Collection Name' })
 @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Collection description' })
 @Expose()
  description!: string | null;

  @ApiProperty({ example: 'user-uuid' })
 @Expose()
  userId!: string;

  @ApiPropertyOptional({ example: 'origin-uuid' })
 @Expose()
  originId!: string | null;

  @ApiProperty({ example: true })
 @Expose()
  isPublic!: boolean;

  @ApiProperty({ type: [String], example: ['en', 'vi'] })
 @Expose()
  languages!: string[];
}

export class OriginUserDto {
  @ApiProperty({ example: 'johndoe' })
  @Expose()
  username!: string;
}

export class CollectionOriginDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Original name' })
  @Expose()
  name!: string;

  @ApiProperty({ type: OriginUserDto })
  @Expose()
  @Type(() => OriginUserDto)
  user!: OriginUserDto;
}

export class CollectionItemDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Bộ từ IELTS' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Mô tả bộ từ vựng', nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;

  @ApiPropertyOptional({ example: 'uuid-string', nullable: true })
  @Expose()
  originId!: string | null;

  @ApiPropertyOptional({ type: CollectionOriginDto, nullable: true })
  @Expose()
  @Type(() => CollectionOriginDto)
  origin!: CollectionOriginDto | null;

  @ApiProperty({ example: { cards: 25 } })
  @Expose()
  _count!: { cards: number };
}

export class CollectionSearchItemDto extends CollectionItemDto {
  @ApiProperty({ type: UserResponse })
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}

export class CollectionSearchResponseDto {
  @ApiProperty({ type: [CollectionSearchItemDto] })
  @Expose()
  @Type(() => CollectionSearchItemDto)
  collections!: CollectionSearchItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  @Expose()
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto;
}

export class CardTypeWithFieldsDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Vocabulary' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Kiểu thẻ từ vựng cơ bản', nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ type: [CardFieldResponseDto] })
  @Expose()
  @Type(() => CardFieldResponseDto)
  fields!: CardFieldResponseDto[];
}

export class CardDetailDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @Expose()
  position!: number | null;

  @ApiProperty({ example: 0 })
  @Expose()
  repetitions!: number;

  @ApiProperty({ example: 0 })
  @Expose()
  interval!: number;

  @ApiProperty({ example: 2.5 })
  @Expose()
  easeFactor!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  @Expose()
  nextReviewDate!: Date;

  @ApiProperty({ type: CardTypeWithFieldsDto })
  @Expose()
  @Type(() => CardTypeWithFieldsDto)
  cardType!: CardTypeWithFieldsDto;

  @ApiProperty({ type: [CardFieldValueResponseDto] })
  @Expose()
  @Type(() => CardFieldValueResponseDto)
  values!: CardFieldValueResponseDto[];
}

export class PublicCollectionResponseDto extends CollectionItemDto{
  @ApiProperty({ type: UserResponse })
  @Expose()
  @Type(() => UserResponse)
  user!: UserResponse;

  @ApiProperty({ type: [CardDetailDto] })
  @Expose()
  @Type(() => CardDetailDto)
  cards!: CardDetailDto[];
}

export class CollectionByIdResponseDto extends PublicCollectionResponseDto {
  @ApiProperty({ example: 5 })
  @Expose()
  newCount!: number;

  @ApiProperty({ example: 10 })
  @Expose()
  dueCount!: number;

  @ApiProperty({ example: 25 })
  @Expose()
  totalCount!: number;
}

export class CreateCollectionResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'Bộ từ IELTS' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'Mô tả bộ từ vựng', nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  userId!: string;

  @ApiProperty({ example: true })
  @Expose()
  isPublic!: boolean;
}

export class ForkCollectionResponseDto extends CreateCollectionResponseDto {
  @ApiProperty({ type: [String], example: ['hello', 'world'] })
  @Expose()
  createdCards!: string[];

  @ApiProperty({ type: [String], example: ['existing'] })
  @Expose()
  updatedCards!: string[];

  @ApiProperty({ type: [String], example: ['skipped'] })
  @Expose()
  skippedCards!: string[];
}

// ─── Import ─────────────────────────────────────────────────

export class ImportCountDetailDto {
  @ApiProperty({ example: 5 })
  @Expose()
  count!: number;

  @ApiProperty({ example: ['hello\tworld'] })
  @Expose()
  cards!: string[];
}

export class ImportErrorDetailDto {
  @ApiProperty({ example: 0 })
  @Expose()
  count!: number;

  @ApiProperty({ example: [] })
  @Expose()
  lines!: string[];
}

export class ImportCardsResponseDto {
  @ApiProperty({ type: ImportCountDetailDto })
  @Expose()
  @Type(() => ImportCountDetailDto)
  imported!: ImportCountDetailDto;

  @ApiProperty({ type: ImportCountDetailDto })
  @Expose()
  @Type(() => ImportCountDetailDto)
  skipped!: ImportCountDetailDto;

  @ApiProperty({ type: ImportCountDetailDto })
  @Expose()
  @Type(() => ImportCountDetailDto)
  updated!: ImportCountDetailDto;

  @ApiProperty({ type: ImportErrorDetailDto })
  @Expose()
  @Type(() => ImportErrorDetailDto)
  errors!: ImportErrorDetailDto;
}

// ─── Card Types ─────────────────────────────────────────────

export class CardTypesResponseDto {
  @ApiProperty({ type: [CardTypeWithFieldsDto] })
  @Expose()
  @Type(() => CardTypeWithFieldsDto)
  cardTypes!: CardTypeWithFieldsDto[];
}

export class ReviewCardResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 1 })
  @Expose()
  repetitions!: number;

  @ApiProperty({ example: 6 })
  @Expose()
  interval!: number;

  @ApiProperty({ example: 2.5 })
  @Expose()
  easeFactor!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  @Expose()
  nextReviewDate!: Date;
}
