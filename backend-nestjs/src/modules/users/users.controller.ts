import { Controller, Patch, Get, UseGuards, Body, Query, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './services/user.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdatePersonalInfoDto } from './dto/users.dto';

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

  // test thôi không dùng
  @Get('all')
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  async getUsers() {
    return this.userService.getAllUsers();
  }
}

