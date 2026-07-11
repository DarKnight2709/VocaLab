import { z } from "zod";

export const WeekActivitySchema = z.object({
  date: z.string(),
  minutes: z.number(),
});

export const HistoryActivitySchema = z.object({
  date: z.string(),
  count: z.number(), // kept for backward compat
  cardsReviewed: z.number().optional(),
  cardsAdded: z.number().optional(),
  cardsUpdated: z.number().optional(),
  cardsDeleted: z.number().optional(),
});

export const StatsResponseSchema = z.object({
  todayMinutes: z.number(),
  dailyGoalMinutes: z.number(),
  weeklyAverageMinutes: z.number(),
  weeklyActivity: z.array(WeekActivitySchema),
  currentStreak: z.number(),
  maxStreak: z.number(),
  totalMinutes: z.number(),
  totalDays: z.number(),
  history: z.array(HistoryActivitySchema),
  totalCards: z.number(),
  masteredCards: z.number(),
  learningCards: z.number(),
  newCards: z.number(),
});

export const CollectionStatsResponseSchema = z.object({
  history: z.array(HistoryActivitySchema),
});

export type WeekActivity = z.infer<typeof WeekActivitySchema>;
export type HistoryActivity = z.infer<typeof HistoryActivitySchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
export type CollectionStatsResponse = z.infer<typeof CollectionStatsResponseSchema>;
