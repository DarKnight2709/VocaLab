export const VoteType = {
  UPVOTE: 'UPVOTE',
  DOWNVOTE: 'DOWNVOTE',
} as const;

export type VoteType = typeof VoteType[keyof typeof VoteType];