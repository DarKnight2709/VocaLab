import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateGroupVisibilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isPublic!: boolean;
}
