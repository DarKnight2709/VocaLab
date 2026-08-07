import { Expose, Type } from 'class-transformer';
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
  @Expose()
  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @ApiProperty({ enum: NotificationType })
  @Expose()
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Expose()
  @IsObject()
  @IsOptional()
  metadata?: any;
}
