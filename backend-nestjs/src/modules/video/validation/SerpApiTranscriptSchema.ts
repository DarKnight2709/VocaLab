import { z } from 'zod';

export const SerpApiTranscriptItemSchema = z.object({
  start_ms: z.number(),
  end_ms: z.number().optional(),
  snippet: z.string(),
  start_time_text: z.string().optional(),
});

export const SerpApiChapterSchema = z.object({
  chapter: z.string(),
  start_ms: z.number(),
  end_ms: z.number().optional(),
});

export const SerpApiTranscriptResponseSchema = z.object({
  transcript: z.array(SerpApiTranscriptItemSchema).default([]),
  chapters: z.array(SerpApiChapterSchema).optional().default([]),
});

export type SerpApiTranscriptItem = z.infer<typeof SerpApiTranscriptItemSchema>;
export type SerpApiChapter = z.infer<typeof SerpApiChapterSchema>;
export type SerpApiTranscriptResponse = z.infer<typeof SerpApiTranscriptResponseSchema>;
