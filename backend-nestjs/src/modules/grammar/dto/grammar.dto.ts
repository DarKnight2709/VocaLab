import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGrammarDto {
  @ApiProperty({ example: 'Present Perfect Simple' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'S + have/has + V3' })
  @IsString()
  @IsNotEmpty()
  structure!: string;

  @ApiProperty({
    example:
      'Dùng để diễn đạt hành động đã xảy ra trong quá khứ nhưng còn liên quan đến hiện tại',
  })
  @IsString()
  @IsNotEmpty()
  explanation!: string;

  @ApiProperty({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  examples?: string[];

  @ApiProperty({ example: 'Thì hiện tại hoàn thành', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    example: 'B1',
    required: false,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateGrammarDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  structure?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  examples?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
