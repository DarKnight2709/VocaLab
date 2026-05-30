import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationSenderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ nullable: true }) // Keep required key, allow null value
  avatar!: string | null;
}

export class NotificationRecipientDto {
  @ApiProperty()
  email!: string;
}

export class NotificationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  recipientId!: string | null;

  @ApiProperty({ nullable: true })
  groupId!: string | null;

  @ApiProperty({ nullable: true })
  groupName!: string | null;

  @ApiProperty({ nullable: true })
  senderId!: string | null;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  metadata!: any;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: NotificationSenderDto, nullable: true })
  sender!: NotificationSenderDto | null;

  @ApiProperty({ type: NotificationRecipientDto, nullable: true })
  recipient!: NotificationRecipientDto | null;
}

export class NotificationMetaDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  lastPage!: number;
}

export class GetNotificationResponseDto {
  @ApiProperty({ type: [NotificationDto] })
  notifications!: NotificationDto[];

  @ApiProperty({ type: NotificationMetaDto })
  meta!: NotificationMetaDto;
}
