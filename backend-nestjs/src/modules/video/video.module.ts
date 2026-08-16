import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { HttpModule } from '@nestjs/axios';
import { YoutubeService } from '@/modules/video/clients/youtube.service';
import { SerpService } from '@/modules/video/clients/serp.service';
import { VideoRepository } from './video.repository';

@Module({
  imports: [HttpModule],
  controllers: [VideoController],
  providers: [VideoService, YoutubeService, SerpService, VideoRepository],
  exports: [VideoService],
})
export class VideoModule {}
