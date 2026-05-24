import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
