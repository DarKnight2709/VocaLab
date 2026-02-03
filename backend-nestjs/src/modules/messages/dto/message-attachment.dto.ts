import { IsString, IsEnum, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { AttachmentType } from '../domain/types/message-attachment.type';

export class MessageAttachmentDto {
  @IsUrl({}, { message: 'URL không hợp lệ' })
  url: string;

  @IsEnum(['image', 'video', 'file', 'audio'], {
    message: 'Type phải là: image, video, file, hoặc audio',
  })
  type: AttachmentType;

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
