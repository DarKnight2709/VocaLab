import { VoteType } from '@prisma/client';

export function mapVoteScore<
  T extends { votes: { type: VoteType; userId?: string }[] },
>(entity: T, currentUserId?: string) {
  let voteScore = 0;
  let userVote: VoteType | null = null;

  entity.votes.forEach((v) => {
    if (v.type === VoteType.UPVOTE) voteScore++;
    else if (v.type === VoteType.DOWNVOTE) voteScore--;

    if (currentUserId && v.userId === currentUserId) {
      userVote = v.type;
    }
  });

  const { votes, ...rest } = entity;
  return { ...rest, voteScore, userVote };
}
