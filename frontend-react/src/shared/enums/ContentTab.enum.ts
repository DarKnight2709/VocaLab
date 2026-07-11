export const ContentTab = {
  FOLLOWERS: "followers",
  FOLLOWING: "following",
  FRIENDS: "friends",
  POSTS: "posts",
  GROUPS: "groups",
  COLLECTIONS: "collections",
} as const;

export type ContentTab = (typeof ContentTab)[keyof typeof ContentTab];
