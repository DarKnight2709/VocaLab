import type { RequestUser } from '@/common/types';
import { Body, Controller, Post, Get, Query, Param, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { StatsResponseDto, CollectionStatsResponseDto } from './dto/stats-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IsProtected } from '@/common/decorators/protected.decorator';

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
  @SerializeOptions({ type: StatsResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Get study stats' })
  async getStats(
    @CurrentUser() user: RequestUser,
    @Query('weekOffset') weekOffset?: string,
  ): Promise<StatsResponseDto> {
    const result = await this.progressService.getStats(user.id, parseInt(weekOffset ?? '0', 10) || 0);
    return result;
  }

  @Get('collections/:id/stats')
  @SerializeOptions({ type: CollectionStatsResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'Get study stats for a specific collection' })
  async getCollectionStats(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<CollectionStatsResponseDto> {
    const result = await this.progressService.getCollectionStats(user.id, id);
    return result;
  }
}
