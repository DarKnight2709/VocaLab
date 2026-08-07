import { Expose, Type } from 'class-transformer';
import { AttachmentType } from '@/common/enums/attachment.enum';
import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus, MessageType } from '@prisma/client';

export class MessageAttachment {
  @ApiProperty()
  @Expose()
  url!: string;

  @ApiProperty({ enum: AttachmentType })
  @Expose()
  type!: AttachmentType;

  @ApiProperty({ nullable: true })
  @Expose()
  name!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  size!: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  mimeType!: string | null;
}

export class UserBasicInfo {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  username!: string;

  @ApiProperty({ nullable: true })
  @Expose()
  fullName!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  canChat!: boolean | null;
}

export class MessageWithDetails {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  type!: MessageType;

  @ApiProperty()
  @Expose()
  senderId!: string;

  @ApiProperty({ nullable: true })
  @Expose()
  receiverId!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  groupId!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  content!: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  replyTo!: string | null;

  @ApiProperty({
    type: () => MessageAttachment,
    isArray: true,
    nullable: true,
  })
  @Expose()
  @Type(() => MessageAttachment)
  attachments!: MessageAttachment[] | null;

  @ApiProperty({ nullable: true })
  @Expose()
  status!: MessageStatus | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty({ type: () => UserBasicInfo, nullable: true })
  @Expose()
  @Type(() => UserBasicInfo)
  sender!: UserBasicInfo | null;

  @ApiProperty({ type: () => UserBasicInfo, nullable: true })
  @Expose()
  @Type(() => UserBasicInfo)
  receiver!: UserBasicInfo | null;

  @ApiProperty({ type: () => UserBasicInfo, isArray: true })
  @Expose()
  @Type(() => UserBasicInfo)
  seenBy!: UserBasicInfo[];
}

export class GetMessagesResponseDto {
  @ApiProperty({ type: () => MessageWithDetails, isArray: true })
  @Expose()
  @Type(() => MessageWithDetails)
  messages!: MessageWithDetails[];
}

export class LastMessageInfo {
  @ApiProperty({ nullable: true })
  @Expose()
  content!: string | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  isMine!: boolean;
}

export class ConversationListItem extends UserBasicInfo {
  @ApiProperty({ type: () => LastMessageInfo, nullable: true })
  @Expose()
  @Type(() => LastMessageInfo)
  lastMessage!: LastMessageInfo | null;

  @ApiProperty()
  @Expose()
  unreadCount!: number;
}

export class GetConversationsResponseDto {
  @ApiProperty({ type: () => ConversationListItem, isArray: true })
  @Expose()
  @Type(() => ConversationListItem)
  users!: ConversationListItem[];
}

export class GetGroupsResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  avatar!: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty()
  @Expose()
  isPublic!: boolean;

  @ApiProperty()
  @Expose()
  unreadCount!: number;

  @ApiProperty()
  @Expose()
  lastMessage!: any;

  @ApiProperty({ type: [String] })
  @Expose()
  members!: string[];

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}