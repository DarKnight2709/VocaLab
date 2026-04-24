export const ContentTab = {
  FOLLOWERS: "followers",
  FOLLOWING: "following",
  FRIENDS: "friends",
  POSTS: "posts",
} as const;

export type ContentTab = (typeof ContentTab)[keyof typeof ContentTab];
