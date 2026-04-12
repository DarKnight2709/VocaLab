import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeRoleDto {
  @ApiProperty({ example: 'CO_OWNER', enum: ['CO_OWNER', 'MEMBER'] })
  @IsString()
  @IsIn(['CO_OWNER', 'MEMBER'])
  newRole!: 'CO_OWNER' | 'MEMBER';
}

