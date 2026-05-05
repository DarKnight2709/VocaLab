export type PublicUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  hasPassword?: boolean;
};

export type TokenUser = Pick<PublicUser, 'id' | 'email'>;