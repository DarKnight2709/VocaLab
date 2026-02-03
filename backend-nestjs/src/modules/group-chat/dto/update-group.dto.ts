import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto {
  @ApiProperty({ example: 'Updated Group Name', required: false })
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://avatar.url', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}

