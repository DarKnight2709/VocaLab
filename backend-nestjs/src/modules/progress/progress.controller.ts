import type { RequestUser } from '@/common/types';
import { Body, Controller, Post, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { StatsResponseDto, CollectionStatsResponseDto } from './dto/stats-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
@ApiTags('progress')
@Controller('progress')
@IsProtected()
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('heartbeat')
  @ApiOperation({ summary: 'Send a heartbeat to increment study time' })
  async heartbeat(
    @CurrentUser() user: RequestUser,
    @Body() dto: HeartbeatDto,
  ): Promise<void> {
    await this.progressService.handleHeartbeat(user.id, dto.seconds);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get study stats' })
  async getStats(
    @CurrentUser() user: RequestUser,
    @Query('weekOffset') weekOffset?: string,
  ): Promise<ResponseInterceptor<StatsResponseDto>> {
    const result = await this.progressService.getStats(user.id, parseInt(weekOffset ?? '0', 10) || 0);
    return {
      data: result
    }
  }
  @Get('collections/:collectionId/stats')
  @ApiOperation({ summary: 'Get study stats for a specific collection' })
  async getCollectionStats(
    @CurrentUser() user: RequestUser,
    @Param('collectionId') collectionId: string,
  ): Promise<ResponseInterceptor<CollectionStatsResponseDto>> {
    const result = await this.progressService.getCollectionStats(user.id, collectionId);
    return {
      data: result
    }
  }
}
