import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { ExtractVideoDto } from './dto/extract-video.dto';
import {
  TranscriptItemDto,
  ChapterItemDto,
  ExtractVideoResponseDto,
} from './dto/extract-video-response.dto';
import { RedisService } from '@/core/cache/redis.service';
import { formatTranscript } from './mappers/transcript.mapper';
import { formatVideoInfo } from './mappers/video-info.mapper';
import { extractYoutubeVideoId } from './utils/youtube-url.util';
import {
  TRANSCRIPT_PROVIDER,
  type ITranscriptProvider,
} from './contracts/transcript-provider.interface';
import {
  VIDEO_INFO_PROVIDER,
  type IVideoInfoProvider,
} from './contracts/video-info-provider.interface';
import {
  VIDEO_REPOSITORY,
  type IVideoRepository,
} from './contracts/video-repository.interface';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly redisService: RedisService,
    @Inject(TRANSCRIPT_PROVIDER)
    private readonly transcriptProvider: ITranscriptProvider,
    @Inject(VIDEO_INFO_PROVIDER)
    private readonly videoInfoProvider: IVideoInfoProvider,
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: IVideoRepository,
  ) {}

  async extract(
    userId: string,
    dto: ExtractVideoDto,
  ): Promise<ExtractVideoResponseDto> {
    const videoId = extractYoutubeVideoId(dto.url);
    if (!videoId) {
      throw new BadRequestException(
        `Could not extract a video ID from the provided URL: ${dto.url}`,
      );
    }
    const cacheKey = `video:extract:${videoId}`;

    // 7 days base TTL (604,800,000 ms)
    const BASE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
    // Random jitter between 0 and 12 hours (43,200,000 ms)
    const JITTER_MS = Math.floor(Math.random() * (12 * 60 * 60 * 1000));
    const TTL_MS = BASE_TTL_MS + JITTER_MS;

    try {
      // Use Read-Through caching pattern via getOrSet
      return await this.redisService.getOrSet<ExtractVideoResponseDto>(
        cacheKey,
        async () => {
          // 1. Fallback to Database Cache
          const existingVideo =
            await this.videoRepository.findByYoutubeId(videoId);
          if (existingVideo) {
            return {
              transcript:
                (existingVideo.transcript as unknown as TranscriptItemDto[]) ||
                [],
              chapters:
                (existingVideo.chapters as unknown as ChapterItemDto[]) || [],
              videoInfo: {
                title: existingVideo.title,
                description: existingVideo.description || '',
                channelTitle: existingVideo.channelTitle || '',
                publishedAt: existingVideo.publishedAt
                  ? existingVideo.publishedAt.toISOString()
                  : '',
                thumbnail: existingVideo.thumbnail || '',
                duration: existingVideo.duration || '',
                viewCount: existingVideo.viewCount || '0',
              },
            };
          }

          // 2. Complete Miss -> Fetch from external APIs
          const [transcript, videoInfo] = await Promise.all([
            this.transcriptProvider.getTranscript(videoId),
            this.videoInfoProvider.getVideoInfo(videoId),
          ]);

          const formattedTranscript = formatTranscript(transcript.transcript);
          const formattedChapters: ChapterItemDto[] = (
            transcript.chapters || []
          ).map((ch) => ({
            title: ch.chapter,
            start: ch.start_ms,
            end: ch.end_ms ?? ch.start_ms,
          }));
          const formattedVideoInfo = formatVideoInfo(videoInfo);

          // 3. Persist to DB in the background
          if (formattedVideoInfo) {
            this.videoRepository
              .upsert({
                youtubeId: videoId,
                userId,
                ...formattedVideoInfo,
                transcript: formattedTranscript,
                chapters: formattedChapters,
              })
              .catch((error: any) => {
                this.logger.error(
                  `Background DB save failed: ${error?.message || error}`,
                );
              });
          }

          return {
            transcript: formattedTranscript,
            chapters: formattedChapters,
            videoInfo: formattedVideoInfo,
          };
        },
        TTL_MS,
      );
    } catch (error: any) {
      const apiError = error?.response?.data;
      const errorMessage =
        apiError?.error ||
        apiError?.message ||
        (typeof apiError === 'string' ? apiError : null) ||
        error?.message ||
        'Failed to extract video';

      this.logger.error(`Error extracting video: ${errorMessage}`);
      if (apiError) {
        this.logger.error(
          `API Error details: ${JSON.stringify(apiError, null, 2)}`,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(errorMessage);
    }
  }
}
