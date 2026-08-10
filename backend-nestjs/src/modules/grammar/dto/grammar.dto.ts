import { GrammarLevel } from '@/common/enums/grammar-level.enum';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
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

  @ApiPropertyOptional({
    example: ['I have eaten breakfast.', 'She has finished her work.'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true }) 
  @IsOptional()
  examples?: string[];

  @ApiPropertyOptional({ example: 'Thì hiện tại hoàn thành' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    example: 'B1',
    enum: GrammarLevel,
  })
  @IsEnum(GrammarLevel) 
  @IsOptional()
  level?: GrammarLevel;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateGrammarDto extends PartialType(CreateGrammarDto) {}