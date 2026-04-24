import { Controller, Patch, Get, UseGuards, Body, Query, Param, UploadedFile, UseInterceptors, Optional } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdatePersonalInfoDto } from './dto/users.dto';
import { PostVisibility } from '../../common/enums/post-visibility.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân',
    description: 'Cập nhật thông tin cá nhân: họ tên, username, email và avatar (nếu có)',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdatePersonalInfoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateProfile(user.id, updateDto, file);
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


  // sẽ thêm cài đặt, nếu chủ cho xem thì người khác sẽ được lấy, còn không chỉ chủ mới được lấy
  @Get(':userId/followers')
  @ApiOperation({ summary: 'Lấy danh sách người theo dõi' })
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowers(userId, page, limit, search);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Lấy danh sách đang theo dõi' })
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFollowing(userId, page, limit, search);
  }

  @Get(':userId/friends')
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  async getFriends(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.getFriends(userId, page, limit, search);
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
      page ? Number(page) : 1,
      limit ? Number(limit) : 12,
      search,
      visibility,
    );
  }

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Lấy thống kê hồ sơ người dùng' })
  async getUserStats(@Param('userId') userId: string) {
    return this.userService.getUserStats(userId);
  }
}

