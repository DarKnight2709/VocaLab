import {
  Injectable,
  Logger,
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
import { validateWithSchema } from '@/common/validation/validate-schema';
import { VideoInfoResSchema } from './validation/VideoInfoResponseSchema';
import { SerpApiTranscriptResponseSchema } from './validation/SerpApiTranscriptSchema';
import { YoutubeService } from '@/modules/video/clients/youtube.service';
import { SerpService } from '@/modules/video/clients/serp.service';
import { formatTranscript } from '@/modules/video/mappers/transcript.mapper';
import { formatVideoInfo } from '@/modules/video/mappers/video-info.mapper';
import { VideoRepository } from './video.repository';
import { extractYoutubeVideoId } from './utils/youtube-url.util';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly redisService: RedisService,
    private readonly videoRepository: VideoRepository,
    private readonly youtubeService: YoutubeService,
    private readonly serpService: SerpService,
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
      // Restore to Redis cache and return
      await this.redisService.setCache(cacheKey, dbResponse);
      return dbResponse;
    }

    try {
      const [rawTranscript, videoInfoRes] = await Promise.all([
        this.serpService.getTranscript(videoId),
        this.youtubeService.getVideoInfo(videoId),
      ]);

      if (rawTranscript.data?.error) {
        throw new BadRequestException(
          `SerpAPI error: ${rawTranscript.data.error}`,
        );
      }
      if (videoInfoRes.data?.error) {
        throw new BadRequestException(
          `YouTube API error: ${JSON.stringify(videoInfoRes.data.error)}`,
        );
      }

      const validatedTranscript = validateWithSchema(
        rawTranscript.data,
        SerpApiTranscriptResponseSchema,
      );
      const validatedVideoInfoRes = validateWithSchema(
        videoInfoRes.data,
        VideoInfoResSchema,
      );
      const formattedTranscript = formatTranscript(
        validatedTranscript.transcript,
      );
      const formattedChapters: ChapterItemDto[] = (
        validatedTranscript.chapters || []
      ).map((ch) => ({
        title: ch.chapter,
        start: ch.start_ms,
        end: ch.end_ms ?? ch.start_ms,
      }));
      const formattedVideoInfo = formatVideoInfo(validatedVideoInfoRes);

      // save into database and cache in the background
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
