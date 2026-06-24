import { PaginationMetaDto } from '@/modules/blog/dto/blog-response.dto';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CardFieldType, CardSide } from '@prisma/client';

// ─── Shared / Reusable DTOs ─────────────────────────────────

export class CardFieldResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'word' })
  key!: string;

  @ApiProperty({ example: 'Từ vựng' })
  label!: string;

  @ApiProperty({ enum: CardFieldType, example: 'TEXT' })
  fieldType!: CardFieldType;

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

export class CollectionListItemDto {
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

  @ApiProperty({ example: { cards: 25 } })
  _count!: { cards: number };
}

export class GetCollectionsResponseDto {
  @ApiProperty({ type: [CollectionListItemDto] })
  collections!: CollectionListItemDto[];
}

export class CollectionSearchItemDto extends CollectionListItemDto {
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

  @ApiProperty({ type: CardTypeWithFieldsDto })
  cardType!: CardTypeWithFieldsDto;

  @ApiProperty({ type: [CardFieldValueResponseDto] })
  values!: CardFieldValueResponseDto[];
}


export class GetCollectionByIdResponseDto {
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

  @ApiProperty({ type: [CardDetailDto] })
  cards!: CardDetailDto[];

  @ApiProperty({ example: { cards: 25 } })
  _count!: { cards: number };
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

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [String], nullable: true })
  copiedCards?: string[];
}

// ─── Cards ──────────────────────────────────────────────────

export class AddCardResponseDto extends CardDetailDto {}

export class UpdateCardResponseDto extends CardDetailDto {}

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

export class GetCardTypesResponseDto {
  @ApiProperty({ type: [CardTypeWithFieldsDto] })
  cardTypes!: CardTypeWithFieldsDto[];
}

export class GetCardTypeByIdResponseDto extends CardTypeWithFieldsDto{}

export class CreateCardTypeResponseDto extends CardTypeWithFieldsDto{}

export class DeleteResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;
}

// ─── Search ─────────────────────────────────────────────────
// export class CollectionSearchItemDto {
//   @ApiProperty({ example: 'uuid-string' })
//   id!: string;

//   @ApiProperty({ example: 'Bộ từ IELTS' })
//   name!: string;

//   @ApiPropertyOptional({ example: 'Mô tả bộ từ vựng', nullable: true })
//   description!: string | null;

//   @ApiProperty({ type: UserResponse })
//   user!: UserResponse;

//   @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
//   createdAt!: Date;

//   @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
//   updatedAt!: Date;
// }


// export class CollectionsSearchResultResponse {
//   @ApiProperty({ type: [CollectionSearchItemDto] })
//   collections!: CollectionSearchItemDto[];

//   @ApiProperty({ type: PaginationMetaDto })
//   meta!: PaginationMetaDto;
// }