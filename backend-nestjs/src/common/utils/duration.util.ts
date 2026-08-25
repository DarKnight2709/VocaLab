export const Duration = {
  seconds: (s: number) => s * 1000,
  minutes: (m: number) => m * 60 * 1000,
  hours: (h: number) => h * 60 * 60 * 1000,
  days: (d: number) => d * 24 * 60 * 60 * 1000,
} as const;
