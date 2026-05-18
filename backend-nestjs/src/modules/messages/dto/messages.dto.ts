import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '@prisma/client';
import { type AttachmentType } from '../messages.types';

export class MessageAttachmentDto {
  @IsUrl({}, { message: 'URL không hợp lệ' })
  url!: string;

  @IsEnum(['image', 'video', 'file', 'audio'], {
    message: 'Type phải là: image, video, file, hoặc audio',
  })
  type!: AttachmentType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Size phải là số' })
  size?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class SendMessageDto {
  @IsString()
  @IsOptional() // Auth user id will be used
  senderId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsEnum(MessageType, { message: 'Type phải là DIRECT hoặc GROUP' })
  type!: MessageType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentDto)
  attachments?: MessageAttachmentDto[];
}
