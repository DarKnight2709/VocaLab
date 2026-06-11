import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { HeartbeatDto } from './dto/heartbeat.dto';
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
    @CurrentUser() user: any,
    @Body() dto: HeartbeatDto,
  ): Promise<void> {
    await this.progressService.handleHeartbeat(user.id, dto.seconds);
  }
}
