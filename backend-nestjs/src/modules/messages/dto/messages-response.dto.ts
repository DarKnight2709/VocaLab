import { AttachmentType } from '@/common/enums/attachment.enum';
import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus, MessageType } from '@prisma/client';
import { Type } from 'class-transformer';

export class MessageAttachment {
  @ApiProperty()
  url!: string;

  @ApiProperty({ enum: AttachmentType })
  type!: AttachmentType;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiProperty({ nullable: true })
  size!: number | null;

  @ApiProperty({ nullable: true })
  mimeType!: string | null;
}

export class UserBasicInfo {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty({ nullable: true })
  fullName!: string | null;

  @ApiProperty({ nullable: true })
  avatar!: string | null;

  @ApiProperty({ nullable: true })
  canChat!: boolean | null;
}

export class MessageWithDetails {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: MessageType;

  @ApiProperty()
  senderId!: string;

  @ApiProperty({ nullable: true })
  receiverId!: string | null;

  @ApiProperty({ nullable: true })
  groupId!: string | null;

  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiProperty({ nullable: true })
  replyTo!: string | null;

  @ApiProperty({
    type: () => MessageAttachment,
    isArray: true,
    nullable: true,
  })
  @Type(() => MessageAttachment)
  attachments!: MessageAttachment[] | null;

  @ApiProperty({ nullable: true })
  status!: MessageStatus | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: () => UserBasicInfo, nullable: true })
  @Type(() => UserBasicInfo)
  sender!: UserBasicInfo | null;

  @ApiProperty({ type: () => UserBasicInfo, nullable: true })
  @Type(() => UserBasicInfo)
  receiver!: UserBasicInfo | null;

  @ApiProperty({ type: () => UserBasicInfo, isArray: true })
  @Type(() => UserBasicInfo)
  seenBy!: UserBasicInfo[];
}

export class GetMessagesResponseDto {
  @ApiProperty({ type: () => MessageWithDetails, isArray: true })
  @Type(() => MessageWithDetails)
  messages!: MessageWithDetails[];
}

export class LastMessageInfo {
  @ApiProperty({ nullable: true })
  content!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  isMine!: boolean;
}

export class ConversationListItem extends UserBasicInfo {
  @ApiProperty({ type: () => LastMessageInfo, nullable: true })
  @Type(() => LastMessageInfo)
  lastMessage!: LastMessageInfo | null;

  @ApiProperty()
  unreadCount!: number;
}

export class GetConversationsResponseDto {
  @ApiProperty({ type: () => ConversationListItem, isArray: true })
  @Type(() => ConversationListItem)
  users!: ConversationListItem[];
}