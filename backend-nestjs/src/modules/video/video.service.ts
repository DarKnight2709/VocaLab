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

    // check redis cache
    const cachedValue =
      await this.redisService.getCache<ExtractVideoResponseDto>(cacheKey);
    if (cachedValue) {
      this.logger.log(`Cache hit for video: ${videoId}`);
      return cachedValue;
    }
    this.logger.log(`Cache miss for video: ${videoId}`);

    // check db cache
    const existingVideo = await this.videoRepository.findByYoutubeId(videoId);
    if (existingVideo) {
      const dbResponse: ExtractVideoResponseDto = {
        transcript:
          (existingVideo.transcript as unknown as TranscriptItemDto[]) || [],
        chapters: (existingVideo.chapters as unknown as ChapterItemDto[]) || [],
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
      await this.redisService.setCache(cacheKey, dbResponse);
      return dbResponse;
    }

    try {
      // Fetch transcript and video info in parallel.
      // Each provider handles its own HTTP errors and schema validation —
      // VideoService only sees clean, typed domain objects.
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

      // Persist to DB and Redis in the background — do not block the response
      if (formattedVideoInfo) {
        Promise.all([
          this.videoRepository.upsert({
            youtubeId: videoId,
            userId,
            ...formattedVideoInfo,
            transcript: formattedTranscript,
            chapters: formattedChapters,
          }),
          this.redisService.setCache(cacheKey, {
            transcript: formattedTranscript,
            chapters: formattedChapters,
            videoInfo: formattedVideoInfo,
          }),
        ]).catch((error: any) => {
          this.logger.error(
            `Background cache/DB save failed: ${error?.message || error}`,
          );
        });
      }

      return {
        transcript: formattedTranscript,
        chapters: formattedChapters,
        videoInfo: formattedVideoInfo,
      };
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
