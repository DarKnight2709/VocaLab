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
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { CardFieldType, CardSide } from '@prisma/client';
import { DuplicatePolicy } from '@/common/enums/duplicate-policy.enum';

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
  @IsNotEmpty()
  value!: string;
}

export class UpdateCardDto extends PartialType(CreateCardDto) {}

export class ImportCardsDto {
  @IsString()
  @IsNotEmpty()
  collectionId!: string;

  @IsString()
  @IsNotEmpty()
  cardTypeId!: string;

  @IsString()
  @IsNotEmpty()
  delimiter!: string
  
  @IsEnum(DuplicatePolicy)
  @IsNotEmpty()
  duplicatePolicy!: DuplicatePolicy


  @IsString()
  @IsNotEmpty()
  rawText!: string
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
  key!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsEnum(CardFieldType)
  @IsNotEmpty()
  fieldType!: CardFieldType;

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
