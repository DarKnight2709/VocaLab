import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { UserResponse } from '@/modules/users/dto/users-response.dto';
export class NotificationRecipientDto {
  @ApiProperty()
  @Expose()
  email!: string;
}
export class NotificationDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ nullable: true })
  @Expose()
  recipientId!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  groupId!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  groupName!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  senderId!: string | null;

  @ApiProperty({ enum: NotificationType })
  @Expose()
  type!: NotificationType;

  @ApiProperty({ nullable: true })
  @Expose()
  content!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  metadata!: any;

  @ApiProperty()
  @Expose()
  isRead!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: UserResponse, nullable: true })
  @Expose()
  @Type(() => UserResponse)
  sender!: UserResponse | null;

  @ApiProperty({ type: NotificationRecipientDto, nullable: true })
  @Expose()
  @Type(() => NotificationRecipientDto)
  recipient!: NotificationRecipientDto | null;
}

export class NotificationMetaDto {
  @ApiProperty()
  @Expose()
  total!: number;

  @ApiProperty()
  @Expose()
  page!: number;

  @ApiProperty()
  @Expose()
  lastPage!: number;
}

export class NotificationResponseDto {
  @ApiProperty({ type: [NotificationDto] })
  @Expose()
  @Type(() => NotificationDto)
  notifications!: NotificationDto[];

  @ApiProperty({ type: NotificationMetaDto })
  @Expose()
  @Type(() => NotificationMetaDto)
  meta!: NotificationMetaDto;
}
