import {
  Injectable,
  Logger,
  Inject,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { ExtractVideoDto } from './dto/extract-video.dto';
import { TranscriptItem, ChapterItem, ExtractVideoResponse } from './interfaces/extract-video.interface';
import { ConfigService } from '@/common/services/config.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@/core/cache/redis.service';
import { validateWithSchema } from '@/common/validation/validate-schema';
import { VideoInfoResSchema, type VideoInfoRes } from './validation/VideoInfoResponseSchema';
import { SerpApiTranscriptResponseSchema, type SerpApiTranscriptItem } from './validation/SerpApiTranscriptSchema';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject()
    private readonly redisService: RedisService,
  ) {}

  async extract(userId: string, dto: ExtractVideoDto): Promise<ExtractVideoResponse> {
    const baseURL = this.configService.get('YOUTUBE_BASE_URL');
    const key = this.configService.get('YOUTUBE_API_KEY');
    const videoId = dto.url.split('v=')[1];
    const videoInformationURL = `${baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${key}`;
    const serpApiBaseUrl = this.configService.get('SERPAPI_URL');
    const separator = serpApiBaseUrl.includes('?') ? '&' : '?';
    const transcriptURL = `${serpApiBaseUrl}${separator}engine=youtube_video_transcript&v=${videoId}&api_key=${this.configService.get('SERPAPI_API_KEY')}`;

    try {
      const [rawTranscript, videoInfoRes] = await Promise.all([
        firstValueFrom(this.httpService.get(transcriptURL)),
        firstValueFrom(this.httpService.get(videoInformationURL)),
      ]);

      if (rawTranscript.data?.error) {
        throw new BadRequestException(`SerpAPI error: ${rawTranscript.data.error}`);
      }
      if (videoInfoRes.data?.error) {
        throw new BadRequestException(`YouTube API error: ${JSON.stringify(videoInfoRes.data.error)}`);
      }

      const validatedTranscript = validateWithSchema(
        rawTranscript.data,
        SerpApiTranscriptResponseSchema,
      );
      const validatedVideoInfoRes = validateWithSchema(
        videoInfoRes.data,
        VideoInfoResSchema,
      );
      const formattedTranscript = this.formatTranscript(validatedTranscript.transcript);
      const formattedChapters: ChapterItem[] = (validatedTranscript.chapters || []).map((ch) => ({
        title: ch.chapter,
        start: ch.start_ms,
        end: ch.end_ms,
      }));
      const formattedVideoInfo = this.formatVideoInfo(validatedVideoInfoRes);
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
        this.logger.error(`API Error details: ${JSON.stringify(apiError, null, 2)}`);
      }

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(errorMessage);
    }
  }

  // HELPER
  formatTranscript(rawTranscript: SerpApiTranscriptItem[]): TranscriptItem[] {
    const formattedTranscript: TranscriptItem[] = [];

    const cleanText = (raw: string) =>
      raw
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();

    const hasPunctuation = rawTranscript.some((item) =>
      /[.!?]/.test(item.snippet),
    );

    let groupText = '';
    let groupStart = 0;
    let groupDurationEnd = 0;

    const flushGroup = () => {
      const trimmed = groupText.trim();
      if (trimmed) {
        formattedTranscript.push({
          text: trimmed,
          start: groupStart,
          duration: groupDurationEnd - groupStart,
        });
      }
      groupText = '';
    };

    for (const item of rawTranscript) {
      const text = cleanText(item.snippet);
      if (!text) continue;

      const chunkEnd = item.end_ms;

      if (!hasPunctuation) {
        if (groupText === '') groupStart = item.start_ms;
        groupText += (groupText ? ' ' : '') + text;
        groupDurationEnd = chunkEnd;

        const wordCount = groupText.split(/\s+/).length;
        if (wordCount >= 15) {
          flushGroup();
        }
        continue;
      }

      if (groupText === '') groupStart = item.start_ms;
      groupText += (groupText ? ' ' : '') + text;
      groupDurationEnd = chunkEnd;

      const wordCount = groupText.split(/\s+/).length;
      const endsWithPunctuation = /[.!?]["']?$/.test(groupText.trim());

      if ((endsWithPunctuation && wordCount >= 10) || wordCount >= 30) {
        flushGroup();
      }
    }

    flushGroup();

    return formattedTranscript;
  }

  formatVideoInfo(videoInfoRes: VideoInfoRes) {
    if (!videoInfoRes.items || videoInfoRes.items.length === 0) {
      return null;
    }

    const item = videoInfoRes.items[0];
    const snippet = item.snippet;
    const statistics = item.statistics;
    const contentDetails = item.contentDetails;

    return {
      title: snippet?.title || '',
      description: snippet?.description || '',
      channelTitle: snippet?.channelTitle || '',
      publishedAt: snippet?.publishedAt || '',
      thumbnail: snippet?.thumbnails?.maxres?.url 
        || snippet?.thumbnails?.high?.url 
        || snippet?.thumbnails?.medium?.url 
        || snippet?.thumbnails?.default?.url 
        || '',
      duration: contentDetails?.duration || '',
      viewCount: statistics?.viewCount || '0',
    };
  }
}
