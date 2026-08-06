import type { RequestUser } from '@/common/types';
import {
  Controller,
  Patch,
  Get,
  Body,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
  Delete,
  Post,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './users.service';
import { VocabularyService } from '../vocabulary/vocabulary.service';
import { GroupChatService } from '../group-chat/group-chat.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UpdatePersonalInfoDto, CreateUserSocialDto } from './dto/users.dto';
import { PostVisibility } from '../../common/enums/post-visibility.enum';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import {
  UpdateProfileResponseDto,
  FollowResponseDto,
  UserSocialDto,
  PublicUserDto,
  UserChatInfoDto,
  FriendsSuggestionResponseDto,
  UserDetailsDto,
  FollowersResponseDto,
  FollowingResponseDto,
  FriendsResponseDto,
  UserPostsResponseDto,
  UserCollectionsResponseDto,
  UserGroupsResponseDto,
  BlockedUsersResponseDto,
} from './dto/users-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => VocabularyService))
    private readonly vocabularyService: VocabularyService,
    @Inject(forwardRef(() => GroupChatService))
    private readonly groupChatService: GroupChatService,
  ) {}

  @Patch('profile')
  @ApiOperation({
    summary: 'Cập nhật thông tin cá nhân',
    description:
      'Cập nhật thông tin cá nhân: họ tên, username, email và avatar (nếu có)',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() updateDto: UpdatePersonalInfoDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ResponseInterceptor<UpdateProfileResponseDto>> {
    const result = await this.userService.updateProfile(
      user.id,
      updateDto,
      file,
    );
    return {
      data: result,
    };
  }

  @Delete('account')
  @ApiOperation({
    summary: 'Xóa tài khoản',
    description: 'Xóa tài khoản cá nhân (Xóa mềm)',
  })
  async deleteAccount(@CurrentUser() user: RequestUser): Promise<void> {
    await this.userService.deleteAccount(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm người dùng' })
  @ApiQuery({ name: 'keyword', required: false })
  async searchUsers(
    @CurrentUser() user: RequestUser,
    @Query('keyword') keyword?: string,
  ): Promise<ResponseInterceptor<PublicUserDto[]>> {
    const result = await this.userService.searchUsers(user.id, keyword);
    return {
      data: result,
    };
  }

  @Get('me/socials')
  @ApiOperation({ summary: 'Lấy danh sách liên kết mạng xã hội của tôi' })
  async getMySocials(
    @CurrentUser() user: RequestUser,
  ): Promise<ResponseInterceptor<UserSocialDto[]>> {
    const result = await this.userService.getMySocials(user.id);
    return {
      data: result,
    };
  }

  @Post('me/socials')
  @ApiOperation({ summary: 'Thêm mới một liên kết mạng xã hội' })
  async createSocial(
    @CurrentUser() user: RequestUser,
    @Body() createDto: CreateUserSocialDto,
  ): Promise<ResponseInterceptor<UserSocialDto>> {
    const result = await this.userService.createSocial(user.id, createDto);
    return {
      data: result,
    };
  }

  @Patch('me/socials/:id')
  @ApiOperation({ summary: 'Cập nhật một liên kết mạng xã hội' })
  async updateSocial(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() updateDto: CreateUserSocialDto,
  ): Promise<ResponseInterceptor<UserSocialDto>> {
    const result = await this.userService.updateSocial(user.id, id, updateDto);
    return {
      data: result,
    };
  }

  @Delete('me/socials/:id')
  @ApiOperation({ summary: 'Xóa một liên kết mạng xã hội' })
  async deleteSocial(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.userService.deleteSocial(user.id, id);
  }

  @Get('me/friends')
  @ApiOperation({ summary: 'Tìm kiếm bạn bè (dành cho gợi ý)' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchFriendsSuggestion(
    @CurrentUser() user: RequestUser,
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ResponseInterceptor<FriendsSuggestionResponseDto>> {
    const result = await this.userService.searchFriendsSuggestion(
      user.id,
      query,
      Number(page) || 1,
      Number(limit) || 5,
    );
    return {
      data: result,
    };
  }

  @Get(':username')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng theo username' })
  async getByUsername(
    @Param('username') username: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<UserDetailsDto>> {
    const result = await this.userService.getByUsername(
      username,
      currentUser?.id,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/chat-info')
  @ApiOperation({
    summary: 'Lấy thông tin chat của người dùng (block & privacy)',
  })
  async getUserChatInfo(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<UserChatInfoDto>> {
    const result = await this.userService.getUserChatInfo(
      userId,
      currentUser.id,
    );
    return { data: result };
  }

  @Get(':userId/followers')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách người theo dõi' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUserFollowers(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponseInterceptor<FollowersResponseDto>> {
    const result = await this.userService.getUserFollowers(
      userId,
      currentUser?.id,
      Number(page),
      Number(limit),
      search,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/following')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách đang theo dõi' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUserFollowing(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponseInterceptor<FollowingResponseDto>> {
    const result = await this.userService.getUserFollowing(
      userId,
      currentUser?.id,
      Number(page),
      Number(limit),
      search,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/friends')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUserFriends(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponseInterceptor<FriendsResponseDto>> {
    const result = await this.userService.getUserFriends(
      userId,
      currentUser?.id,
      Number(page),
      Number(limit),
      search,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/posts')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách bài viết của người dùng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'visibility', required: false, enum: PostVisibility })
  async getUserPosts(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('visibility') visibility?: PostVisibility,
  ): Promise<ResponseInterceptor<UserPostsResponseDto>> {
    const result = await this.userService.getUserPosts(
      userId,
      currentUser?.id,
      Number(page),
      Number(limit),
      search,
      visibility,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/collections')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách bộ sưu tập của người dùng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'visibility', required: false })
  async getUserCollections(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('visibility') visibility?: PostVisibility,
  ): Promise<ResponseInterceptor<UserCollectionsResponseDto>> {
    const result = await this.vocabularyService.getUserCollections(
      userId,
      currentUser?.id,
      Number(page) || 1,
      Number(limit) || 12,
      search,
      visibility,
    );
    return {
      data: result,
    };
  }

  @Get(':userId/groups')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách nhóm của người dùng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getUserGroups(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponseInterceptor<UserGroupsResponseDto>> {
    const result = await this.groupChatService.getUserGroups(
      userId,
      currentUser?.id,
      Number(page) || 1,
      Number(limit) || 12,
      search,
    );
    return {
      data: result,
    };
  }

  @Post(':userId/follow')
  @ApiOperation({ summary: 'Theo dõi người dùng' })
  async followUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<FollowResponseDto>> {
    const result = await this.userService.followUser(userId, currentUser.id);
    return {
      data: result,
    };
  }

  @Post(':userId/unfollow')
  @ApiOperation({ summary: 'Bỏ theo dõi người dùng' })
  async unfollowUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<FollowResponseDto>> {
    const result = await this.userService.unfollowUser(userId, currentUser.id);
    return {
      data: result,
    };
  }

  @Post(':userId/block')
  @ApiOperation({ summary: 'Chặn người dùng' })
  async blockUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<FollowResponseDto>> {
    const result = await this.userService.blockUser(userId, currentUser.id);
    return {
      data: result,
    };
  }

  @Post(':userId/unblock')
  @ApiOperation({ summary: 'Bỏ chặn người dùng' })
  async unblockUser(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
  ): Promise<ResponseInterceptor<FollowResponseDto>> {
    const result = await this.userService.unblockUser(userId, currentUser.id);
    return {
      data: result,
    };
  }

  @Get(':userId/blocked')
  @ApiOperation({ summary: 'Lấy danh sách người dùng đã chặn' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getBlockedUsers(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: RequestUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ): Promise<ResponseInterceptor<BlockedUsersResponseDto>> {
    const result = await this.userService.getBlockedUsers(
      userId,
      currentUser.id,
      Number(page) || 1,
      Number(limit) || 12,
      search,
    );
    return {
      data: result,
    };
  }
}
