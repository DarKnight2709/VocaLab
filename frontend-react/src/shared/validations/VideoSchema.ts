import { z } from "zod";

export const ExtractVideoPayloadSchema = z.object({
  url: z.string().url(),
});

export const TranscriptItemSchema = z.object({
  text: z.string(),
  start: z.number(),
  duration: z.number(),
});

export const ChapterItemSchema = z.object({
  title: z.string(),
  start: z.number(),
  end: z.number(),
});

export const VideoInfoSchema = z.object({
  title: z.string(),
  description: z.string(),
  channelTitle: z.string(),
  publishedAt: z.string(),
  thumbnail: z.string(),
  duration: z.string(),
  viewCount: z.string(),
}).nullable();

export const ExtractVideoResponseSchema = z.object({
  transcript: z.array(TranscriptItemSchema),
  chapters: z.array(ChapterItemSchema).default([]),
  videoInfo: VideoInfoSchema,
});

export type ExtractVideoPayloadType = z.infer<typeof ExtractVideoPayloadSchema>;
export type TranscriptItemType = z.infer<typeof TranscriptItemSchema>;
export type ChapterItemType = z.infer<typeof ChapterItemSchema>;
export type VideoInfoType = z.infer<typeof VideoInfoSchema>;
export type ExtractVideoResponseType = z.infer<typeof ExtractVideoResponseSchema>;
