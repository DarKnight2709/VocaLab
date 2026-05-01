export const SocialPlatform = {
  FACEBOOK: "FACEBOOK",
  INSTAGRAM: "INSTAGRAM",
  TWITTER: "TWITTER",
  YOUTUBE: "YOUTUBE",
  TIKTOK: "TIKTOK",
  LINKEDIN: "LINKEDIN",
  CUSTOM: "CUSTOM",
} as const;

export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];