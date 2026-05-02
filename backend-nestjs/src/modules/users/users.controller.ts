import {
  Controller,
  Patch,
  Get,
  UseGuards,
  Body,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
  Delete,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdatePersonalInfoDto, UpdatePersonalInfoResponseDto } from './dto/users.dto';
import { CreateUserSocialDto } from './dto/social-link.dto';
import { PostVisibility } from '../../common/enums/post-visibility.enum';
import { Response } from '@/common/interceptors/transform.interceptor';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân',
    description:
      'Cập nhật thông tin cá nhân: họ tên, username, email và avatar (nếu có)',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdatePersonalInfoDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Response<UpdatePersonalInfoResponseDto>> {
    const data = await this.userService.updateProfile(user.id, updateDto, file);
    return {
      data: data,
      message: 'Cập nhật thông tin thành công!',
    }
  }

  @Delete('profile')
  @ApiOperation({
    summary: 'Xóa tài khoản',
    description: 'Xóa tài khoản cá nhân (Xóa mềm)',
  })
  async deleteProfile(
    @CurrentUser() user: any,
  ): Promise<Response<void>> {
    await this.userService.deleteAccount(user.id);
    return {
      message: 'Xóa tài khoản thành công!',
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm người dùng và nhóm' })
  async search(@CurrentUser() user: any, @Query('keyword') keyword: string) {
    if (!keyword) {
      return { message: 'Vui lòng cung cấp keyword để tìm kiếm!' };
    }
    return this.userService.search(keyword, user.id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  async getUsers() {
    return this.userService.getAllUsers();
  }

  @Get('by-username/:username')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng theo username' })
  async getByUsername(@Param('username') username: string) {
    return this.userService.getByUsername(username);
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'Lấy danh sách người theo dõi' })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowers(
      userId,
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Lấy danh sách đang theo dõi' })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowing(
      userId,
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':userId/friends')
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  async getFriends(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFriends(
      userId,
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get(':userId/posts')
  @ApiOperation({ summary: 'Lấy danh sách bài viết của người dùng' })
  async getPosts(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('visibility') visibility?: PostVisibility,
  ) {
    return this.userService.getPosts(
      userId,
      currentUser?.id,
      Number(page),
      Number(limit),
      search,
      visibility,
    );
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Lấy thống kê hồ sơ người dùng' })
  async getUserStats(@Param('userId') userId: string) {
    return this.userService.getUserStats(userId);
  }

  @Get(':userId/me/following')
  @ApiOperation({ summary: 'Kiểm tra xem mình có đang follow user này không' })
  async checkFollowStatus(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.userService.checkFollowStatus(userId, currentUser.id);
  }

  @Post(':userId/follow')
  @ApiOperation({ summary: 'Theo dõi người dùng' })
  async followUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.userService.followUser(userId, currentUser.id);
  }

  @Delete(':userId/unfollow')
  @ApiOperation({ summary: 'Bỏ theo dõi người dùng' })
  async unfollowUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.userService.unfollowUser(userId, currentUser.id);
  }

  @Get('me/socials')
  @ApiOperation({ summary: 'Lấy danh sách liên kết mạng xã hội của tôi' })
  async getMySocials(@CurrentUser() user: any) {
    return this.userService.getMySocials(user.id);
  }

  @Post('me/socials')
  @ApiOperation({ summary: 'Thêm mới một liên kết mạng xã hội' })
  async createSocial(
    @CurrentUser() user: any,
    @Body() createDto: CreateUserSocialDto,
  ) {
    return this.userService.createSocial(user.id, createDto);
  }

  @Patch('me/socials/:id')
  @ApiOperation({ summary: 'Cập nhật một liên kết mạng xã hội' })
  async updateSocial(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: CreateUserSocialDto,
  ) {
    return this.userService.updateSocial(user.id, id, updateDto);
  }

  @Delete('me/socials/:id')
  @ApiOperation({ summary: 'Xóa một liên kết mạng xã hội' })
  async deleteSocial(@CurrentUser() user: any, @Param('id') id: string) {
    return this.userService.deleteSocial(user.id, id);
  }
}
