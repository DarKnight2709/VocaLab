import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '@prisma/client';
import { MessageAttachmentDto } from './message-attachment.dto';

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
  type: MessageType;

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
