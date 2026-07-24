import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { VideoService } from './video.service';
import { ExtractVideoDto } from './dto/extract-video.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response as ResponseInterceptor } from '@/common/interceptors/transform.interceptor';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { RequestUser } from '@/common/types';
import { ExtractVideoResponse } from './interfaces/extract-video.interface';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('extract')
  @ApiOperation({ summary: 'extract video transcript & information' })
  @HttpCode(HttpStatus.OK)
  async extract(
    @CurrentUser() user: RequestUser,
    @Body() extractVideoDto: ExtractVideoDto,
  ): Promise<ResponseInterceptor<ExtractVideoResponse>> {
    const result = await this.videoService.extract(user.id, extractVideoDto);
    return { data: result };
  }
}
