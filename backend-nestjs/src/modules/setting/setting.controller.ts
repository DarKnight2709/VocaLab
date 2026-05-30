import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateAllowFollowDto, UpdateMessageScopeDto, UpdateFollowersTabVisibilityDto, UpdateFollowingTabVisibilityDto, UpdateFriendTabVisibilityDto } from './dto/setting.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationSettingDto, UpdateChatMessagesDto, UpdateCommentsDto, UpdateUpvotesDto, UpdateNewFollowersDto, UpdateActivityFromFollowedDto } from './dto/notication-settings.dto';

import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';

@ApiTags('settings')
@Controller('settings')
@IsProtected()
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Patch('allow-follow')
  @ApiOperation({ summary: 'Update allow follow setting' })
  async updateAllowFollow(
    @CurrentUser() user: any,
    @Body() dto: UpdateAllowFollowDto,
  ): Promise<void> {
    await this.settingService.updateAllowFollow(user.id, dto);
  }

  @Patch('message-scope')
  @ApiOperation({ summary: 'Update message scope setting' })
  async updateMessageScope(
    @CurrentUser() user: any,
    @Body() dto: UpdateMessageScopeDto,
  ): Promise<void> {
    await this.settingService.updateMessageScope(user.id, dto);
  }

  @Patch('followers-tab-visibility')
  @ApiOperation({ summary: 'Update followers tab visibility setting' })
  async updateFollowersTabVisibility(
    @CurrentUser() user: any,
    @Body() dto: UpdateFollowersTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFollowersTabVisibility(user.id, dto);
  }

  @Patch('following-tab-visibility')
  @ApiOperation({ summary: 'Update following tab visibility setting' })
  async updateFollowingTabVisibility(
    @CurrentUser() user: any,
    @Body() dto: UpdateFollowingTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFollowingTabVisibility(user.id, dto);
  }

  @Patch('friend-tab-visibility')
  @ApiOperation({ summary: 'Update friend tab visibility setting' })
  async updateFriendTabVisibility(
    @CurrentUser() user: any,
    @Body() dto: UpdateFriendTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFriendTabVisibility(user.id, dto);
  }
  
  @Get('notifications')
  @ApiOperation({ summary: 'Get notification settings' })
  async getSettings(
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<NotificationSettingDto>> {
    const result = await this.settingService.getSettings(user.id);
    return { data: result };
  }

  @Patch('notifications/chat-messages')
  @ApiOperation({ summary: 'Update chat messages notification setting' })
  async updateChatMessages(
    @CurrentUser() user: any,
    @Body() dto: UpdateChatMessagesDto,
  ): Promise<void> {
    await this.settingService.updateChatMessages(user.id, dto);
  }

  @Patch('notifications/comments')
  @ApiOperation({ summary: 'Update comments notification setting' })
  async updateComments(
    @CurrentUser() user: any,
    @Body() dto: UpdateCommentsDto,
  ): Promise<void> {
    await this.settingService.updateComments(user.id, dto);
  }

  @Patch('notifications/upvotes')
  @ApiOperation({ summary: 'Update upvotes notification setting' })
  async updateUpvotes(
    @CurrentUser() user: any,
    @Body() dto: UpdateUpvotesDto,
  ): Promise<void> {
    await this.settingService.updateUpvotes(user.id, dto);
  }



  @Patch('notifications/new-followers')
  @ApiOperation({ summary: 'Update new followers notification setting' })
  async updateNewFollowers(
    @CurrentUser() user: any,
    @Body() dto: UpdateNewFollowersDto,
  ): Promise<void> {
    await this.settingService.updateNewFollowers(user.id, dto);
  }

  @Patch('notifications/activity-from-followed')
  @ApiOperation({ summary: 'Update activity from followed notification setting' })
  async updateActivityFromFollowed(
    @CurrentUser() user: any,
    @Body() dto: UpdateActivityFromFollowedDto,
  ): Promise<void> {
    await this.settingService.updateActivityFromFollowed(user.id, dto);
  }
}
