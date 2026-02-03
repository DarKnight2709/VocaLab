import { CreateUserDto, UpdatePersonalInfoDto } from '../../dto/users.dto';
import { UserEntity } from '../user.entity';

export const IUSER_REPOSITORY = 'IUSER_REPOSITORY';

export interface UserRepositoryInterface {
  create(data: CreateUserDto): Promise<UserEntity>;
  update(id: string, data: UpdatePersonalInfoDto): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  searchUsers(keyword: string, userId: string): Promise<UserEntity[]>;
  // test thôi
  findAll(): Promise<UserEntity[]>;
}
