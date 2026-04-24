export const PostVisibility = {
  ALL: "all",
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type PostVisibility = (typeof PostVisibility)[keyof typeof PostVisibility];
