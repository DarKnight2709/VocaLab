export const SettingTab = {
  ACCCOUNT: "account",
  PRIVACY: "privacy",
  PREFERENCES: "preferences",
  NOTIFICATIONS: "notifications",
  LEARNING: "learning"
} as const;

export type SettingTab = (typeof SettingTab)[keyof typeof SettingTab];
