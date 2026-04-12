export const MemberRole = {
  OWNER: 'OWNER',
  CO_OWNER: 'CO_OWNER',
  MEMBER: 'MEMBER',
} as const;

export type MemberRole = typeof MemberRole[keyof typeof MemberRole];
