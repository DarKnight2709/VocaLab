import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { UpdatePersonalInfoDto } from '../dto/users.dto';
import {
  UserRepositoryInterface,
  IUSER_REPOSITORY,
} from '../domain/interfaces/user-repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(IUSER_REPOSITORY)
    private userRepository: UserRepositoryInterface,
    private cloudinaryService: CloudinaryService,
  ) {}

  async updateProfile(userId: string, updateDto: UpdatePersonalInfoDto) {
    try {
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Check username exists for other users
      if (updateDto.username) {
        const existingUserByUsername = await this.userRepository.findByUsername(
          updateDto.username,
        );
        if (existingUserByUsername && existingUserByUsername.id !== userId) {
          throw new ConflictException('Username này đã tồn tại');
        }
      }

      // Check email exists for other users
      if (updateDto.email) {
        const existingEmail = await this.userRepository.findByEmail(
          updateDto.email,
        );
        if (existingEmail && existingEmail.id !== userId) {
          throw new ConflictException('Email này đã tồn tại');
        }
      }

      const updatedUser = await this.userRepository.update(userId, updateDto);

      return {
        message: 'Cập nhật tài khoản thành công',
        user: updatedUser,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    const avatarUrl = result.secure_url;

    const updateUserDto: UpdatePersonalInfoDto = {
      avatar: avatarUrl,
    };

    const updatedUser = await this.userRepository.update(userId, updateUserDto);

    return {
      message: 'Avatar updated',
      avatarUrl: updatedUser.avatar,
    };
  }

  async search(keyword: string, userId: string) {
    const users = await this.userRepository.searchUsers(keyword, userId);
    // TODO: Also search groups - this will be handled in group-chat module
    return {
      message: 'Tìm kiếm thành công!',
      users,
      groups: [], // Will be populated by group service
    };
  }

  // test thôi

  async getAllUsers() {
    return this.userRepository.findAll();
  }
}
