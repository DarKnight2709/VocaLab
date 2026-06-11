import { z } from "zod";

export const WeekActivitySchema = z.object({
  date: z.string(),
  minutes: z.number(),
});

export const StatsResponseSchema = z.object({
  todayMinutes: z.number(),
  dailyGoalMinutes: z.number(),
  weeklyAverageMinutes: z.number(),
  weeklyActivity: z.array(WeekActivitySchema),
});

export type WeekActivity = z.infer<typeof WeekActivitySchema>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
