import { Body, Controller, Patch } from '@nestjs/common';
import { SettingService } from './setting.service';
import { UpdateAllowFollowDto, UpdateMessageScopeDto, UpdateFollowersTabVisibilityDto, UpdateFollowingTabVisibilityDto, UpdateFriendTabVisibilityDto } from './dto/setting.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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
}
