import { Exclude } from "class-transformer";

export class UserEntity {
  id: string;
  username: string;
  
  @Exclude()
  hashedPassword?: string;

  fullName: string;
  email: string;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

}
