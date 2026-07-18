import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  MinLength,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { CardSide } from '@prisma/client';
import { DuplicatePolicy } from '@/common/enums/duplicate-policy.enum';
import { UpdateCardType } from '@/common/enums/update-card-type';
import { UpdateCard } from '@/common/enums/update-card';
import { SrsRating } from '@/common/enums/srs-rating.enum';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
export class ForkCollectionDto extends CreateCollectionDto {
  @IsBoolean()
  mergeCardType!: boolean;

  @IsEnum(UpdateCardType)
  updateCardType!: UpdateCardType;

  @IsEnum(UpdateCard)
  updateCard!: UpdateCard;
}

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {}

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  cardTypeId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cardCollectionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardValueDto)
  values!: CardValueDto[];
}

export class CardValueDto {
  @IsString()
  @IsNotEmpty()
  fieldId!: string;

  @IsString()
  value!: string;
}

export class UpdateCardDto extends OmitType(CreateCardDto, ['cardTypeId'] as const) { }
export class ImportCardsDto {
  @IsString()
  @IsNotEmpty()
  collectionId!: string;

  @IsString()
  @IsNotEmpty()
  cardTypeId!: string;

  @IsString()
  @IsNotEmpty()
  delimiter!: string;

  @IsEnum(DuplicatePolicy)
  @IsNotEmpty()
  duplicatePolicy!: DuplicatePolicy;

  @IsString()
  @IsNotEmpty()
  rawText!: string;
}

export class CreateCardTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardFieldDto)
  fields!: CardFieldDto[];
}

export class CardFieldDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsEnum(CardSide)
  @IsNotEmpty()
  side!: CardSide;

  @IsNumber()
  order!: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  fontSize?: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class ReviewCardDto {
  @IsEnum(SrsRating)
  @IsNotEmpty()
  rating!: SrsRating;
}
