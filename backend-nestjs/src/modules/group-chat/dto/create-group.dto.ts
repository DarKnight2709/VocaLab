import { IsString, IsArray, MinLength, ArrayMinSize, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'My Group' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: ['user1', 'user2'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  members!: string[];

  @ApiProperty({ example: 'Group description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
