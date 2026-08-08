import type { RequestUser } from '@/common/types';
import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  SerializeOptions,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { NotificationResponseDto } from './dto/notifications-response.dto';
import { NotificationsService } from './services/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @SerializeOptions({ type: NotificationResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNotifications(
    @CurrentUser() user: RequestUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<NotificationResponseDto> {
    const result = await this.notificationsService.getNotifications(
      user.id,
      page,
      limit,
    );
    return result;
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Số lượng thông báo chưa đọc' })
  async getUnreadCount(
    @CurrentUser() user: RequestUser,
  ): Promise<number> {
    const result = await this.notificationsService.getUnreadCount(user.id);
    return result;
  }

  @Patch(['read', 'read/:id'])
  @ApiOperation({ summary: "Đánh dấu đã đọc"})
  async markAsRead(
    @CurrentUser() user: RequestUser,
    @Param('id') notificationId?: string,
  ): Promise<void> {
    await this.notificationsService.markAsRead(
      user.id,
      notificationId,
    );
  }
}
