import { Controller, Post, Body, HttpCode, HttpStatus, SerializeOptions } from '@nestjs/common';
import { VideoService } from './video.service';
import { ExtractVideoDto } from './dto/extract-video.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { RequestUser } from '@/common/types';
import { ExtractVideoResponseDto } from './dto/extract-video-response.dto';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('extract')
  @SerializeOptions({ type: ExtractVideoResponseDto, excludeExtraneousValues: true })
  @ApiOperation({ summary: 'extract video transcript & information' })
  @HttpCode(HttpStatus.OK)
  async extract(
    @CurrentUser() user: RequestUser,
    @Body() extractVideoDto: ExtractVideoDto,
  ): Promise<ExtractVideoResponseDto> {
    const result = await this.videoService.extract(user.id, extractVideoDto);
    return result;
  }
}
