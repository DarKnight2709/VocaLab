import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { SerpService } from './clients/serp.service';
import { YoutubeService } from './clients/youtube.service';
import { VideoRepository } from './video.repository';
import {
  TRANSCRIPT_PROVIDER,
} from './contracts/transcript-provider.interface';
import {
  VIDEO_INFO_PROVIDER,
} from './contracts/video-info-provider.interface';
import {
  VIDEO_REPOSITORY,
} from './contracts/video-repository.interface';

@Module({
  imports: [HttpModule],
  controllers: [VideoController],
  providers: [
    VideoService,
    // Bind abstractions to concrete implementations.
    { provide: TRANSCRIPT_PROVIDER, useClass: SerpService },
    { provide: VIDEO_INFO_PROVIDER, useClass: YoutubeService },
    { provide: VIDEO_REPOSITORY,    useClass: VideoRepository },
  ],
  exports: [VideoService],
})
export class VideoModule {}
