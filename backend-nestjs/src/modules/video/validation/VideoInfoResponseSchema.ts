import { z } from 'zod';

export const ThumbnailSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const ThumbnailsSchema = z.object({
  default: ThumbnailSchema.optional(),
  medium: ThumbnailSchema.optional(),
  high: ThumbnailSchema.optional(),
  standard: ThumbnailSchema.optional(),
  maxres: ThumbnailSchema.optional(),
});

export const SnippetSchema = z.object({
  publishedAt: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  channelTitle: z.string().optional(),
  thumbnails: ThumbnailsSchema.optional(),
  categoryId: z.string().optional(),
  defaultLanguage: z.string().optional(),
});

export const ContentDetailsSchema = z.object({
  duration: z.string().optional(),
});

export const StatisticsSchema = z.object({
  viewCount: z.string().optional(),
});

export const VideoItemSchema = z.object({
  snippet: SnippetSchema.optional(),
  contentDetails: ContentDetailsSchema.optional(),
  statistics: StatisticsSchema.optional(),
});

export const VideoInfoResSchema = z.object({
  items: z.array(VideoItemSchema),
});

export type Thumbnail = z.infer<typeof ThumbnailSchema>;
export type Thumbnails = z.infer<typeof ThumbnailsSchema>;
export type Snippet = z.infer<typeof SnippetSchema>;
export type ContentDetails = z.infer<typeof ContentDetailsSchema>;
export type Statistics = z.infer<typeof StatisticsSchema>;
export type VideoItem = z.infer<typeof VideoItemSchema>;
export type VideoInfoRes = z.infer<typeof VideoInfoResSchema>;
