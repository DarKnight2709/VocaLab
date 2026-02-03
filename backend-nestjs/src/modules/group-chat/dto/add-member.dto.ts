import { IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: ['user1', 'user2'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  memberIds: string[];
}

