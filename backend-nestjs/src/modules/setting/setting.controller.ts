import type { RequestUser } from '@/common/types';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Patch,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { SettingService } from './setting.service';
import {
  UpdateAllowFollowDto,
  UpdateMessageScopeDto,
  UpdateFollowersTabVisibilityDto,
  UpdateFollowingTabVisibilityDto,
  UpdateFriendTabVisibilityDto,
  UpdateGroupsTabVisibilityDto,
  UpdateNewFollowersDto,
  UpdateUpvotesDto,
  UpdateCommentsDto,
  UpdateActivityFromFollowedDto,
  CreateReminderDto,
  UpdateDailyGoalDto,
  UpdateChatMessagesDto,
} from './dto/setting.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Post, Delete, Param } from '@nestjs/common';
import { DailyGoalResponseDto, NotificationSettingDto, ReminderDeleteResponseDto, ReminderListResponseDto, ReminderResponseDto } from './dto/setting-response.dto';

@ApiTags('settings')
@Controller('settings')
@IsProtected()
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Patch('allow-follow')
  @ApiOperation({ summary: 'Update allow follow setting' })
  async updateAllowFollow(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateAllowFollowDto,
  ): Promise<void> {
    await this.settingService.updateAllowFollow(user.id, dto);
  }

  @Patch('message-scope')
  @ApiOperation({ summary: 'Update message scope setting' })
  async updateMessageScope(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateMessageScopeDto,
  ): Promise<void> {
    await this.settingService.updateMessageScope(user.id, dto);
  }

  @Patch('followers-tab-visibility')
  @ApiOperation({ summary: 'Update followers tab visibility setting' })
  async updateFollowersTabVisibility(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFollowersTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFollowersTabVisibility(user.id, dto);
  }

  @Patch('following-tab-visibility')
  @ApiOperation({ summary: 'Update following tab visibility setting' })
  async updateFollowingTabVisibility(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFollowingTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFollowingTabVisibility(user.id, dto);
  }

  @Patch('friend-tab-visibility')
  @ApiOperation({ summary: 'Update friend tab visibility setting' })
  async updateFriendTabVisibility(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateFriendTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateFriendTabVisibility(user.id, dto);
  }

  @Patch('groups-tab-visibility')
  @ApiOperation({ summary: 'Update groups tab visibility setting' })
  async updateGroupsTabVisibility(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateGroupsTabVisibilityDto,
  ): Promise<void> {
    await this.settingService.updateGroupsTabVisibility(user.id, dto);
  }

  @Get('notifications')
  @SerializeOptions({
    type: NotificationSettingDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Get notification settings' })
  async getSettings(
    @CurrentUser() user: RequestUser,
  ): Promise<NotificationSettingDto> {
    const result = await this.settingService.getSettings(user.id);
    return result;
  }

  @Patch('notifications/chat-messages')
  @ApiOperation({ summary: 'Update chat messages notification setting' })
  async updateChatMessages(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateChatMessagesDto,
  ): Promise<void> {
    await this.settingService.updateChatMessages(user.id, dto);
  }

  @Patch('notifications/comments')
  @ApiOperation({ summary: 'Update comments notification setting' })
  async updateComments(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCommentsDto,
  ): Promise<void> {
    await this.settingService.updateComments(user.id, dto);
  }

  @Patch('notifications/upvotes')
  @ApiOperation({ summary: 'Update upvotes notification setting' })
  async updateUpvotes(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateUpvotesDto,
  ): Promise<void> {
    await this.settingService.updateUpvotes(user.id, dto);
  }

  @Patch('notifications/new-followers')
  @ApiOperation({ summary: 'Update new followers notification setting' })
  async updateNewFollowers(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateNewFollowersDto,
  ): Promise<void> {
    await this.settingService.updateNewFollowers(user.id, dto);
  }

  @Patch('notifications/activity-from-followed')
  @ApiOperation({
    summary: 'Update activity from followed notification setting',
  })
  async updateActivityFromFollowed(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateActivityFromFollowedDto,
  ): Promise<void> {
    await this.settingService.updateActivityFromFollowed(user.id, dto);
  }

  // Reminders
  @Get('reminders')
  @SerializeOptions({
    type: ReminderListResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Get user reminders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getReminders(
    @CurrentUser() user: RequestUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<ReminderListResponseDto> {
    const result = await this.settingService.getReminders(
      user.id,
      page,
      limit,
      search,
    );
    return result;
  }

  @Post('reminders')
  @SerializeOptions({
    type: ReminderResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Create a reminder' })
  async createReminder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const result = await this.settingService.createReminder(user.id, dto);
    return result;
  }

  @Patch('reminders/:id')
  @SerializeOptions({
    type: ReminderResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Update a reminder' })
  async updateReminder(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const result = await this.settingService.updateReminder(user.id, id, dto);
    return result;
  }

  @Patch('reminders/:id/toggle')
  @ApiOperation({ summary: 'Toggle a reminder' })
  async toggleReminder(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.settingService.toggleReminder(user.id, id);
  }

  @Delete('reminders/:id')
  @SerializeOptions({
    type: ReminderDeleteResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Delete a reminder' })
  async deleteReminder(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<ReminderDeleteResponseDto> {
    const result = await this.settingService.deleteReminder(user.id, id);
    return result;
  }

  @Get('daily-goal')
  @SerializeOptions({
    type: DailyGoalResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Get user daily goals' })
  async getDailyProgress(
    @CurrentUser() user: RequestUser,
  ): Promise<DailyGoalResponseDto> {
    const result = await this.settingService.getDailyGoal(user.id);
    return result;
  }

  @Patch('daily-goal')
  @SerializeOptions({
    type: DailyGoalResponseDto,
    excludeExtraneousValues: true,
  })
  @ApiOperation({ summary: 'Update user daily goals' })
  async updateDailyProgress(
    @CurrentUser() user: RequestUser,
    @Body() updateDto: UpdateDailyGoalDto,
  ): Promise<DailyGoalResponseDto> {
    const result = await this.settingService.updateDailyGoal(
      user.id,
      updateDto,
    );
    return result;
  }
}
