import {
  Controller,
  Get,
  Patch,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { GetNotificationResponseDto } from './dto/notifications-response.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getNotifications(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<ResponseInterceptor<GetNotificationResponseDto>> {
    const result = await this.notificationsService.getNotifications(
      user.id,
      page,
      limit,
    );
    return { data: result };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Số lượng thông báo chưa đọc' })
  async getUnreadCount(
    @CurrentUser() user: any,
  ): Promise<ResponseInterceptor<number>> {
    const result = await this.notificationsService.getUnreadCount(user.id);
    return { data: result };
  }

  @Patch(['read', 'read/:id'])
  @ApiOperation({ summary: "Đánh dấu đã đọc"})
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') notificationId?: string,
  ): Promise<void> {
    await this.notificationsService.markAsRead(
      user.id,
      notificationId,
    );
  }
}
