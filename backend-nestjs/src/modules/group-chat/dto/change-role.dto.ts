import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRoleDto {
  @ApiProperty({ example: 'admin', enum: ['admin', 'member'] })
  @IsString()
  @IsIn(['admin', 'member'])
  newRole: 'admin' | 'member';
}

