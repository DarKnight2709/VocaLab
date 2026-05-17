export const ScopeVisibility = {
  EVERYONE: "EVERYONE",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;

export type ScopeVisibilityType = (typeof ScopeVisibility)[keyof typeof ScopeVisibility];
