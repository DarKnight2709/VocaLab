export type AttachmentType = 'image' | 'video' | 'file' | 'audio';
export interface MessageAttachment {
  url: string;
  type: AttachmentType;
  name?: string;
  size?: number;
  mimeType?: string;
}