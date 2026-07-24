import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { TranscriptResponse, YoutubeTranscript } from 'youtube-transcript';
import { ExtractVideoDto } from './dto/extract-video.dto';
import { TranscriptItem, ExtractVideoResponse } from './interfaces/extract-video.interface';
import { ConfigService } from '@/common/services/config.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '@/core/cache/redis.service';
import { validateWithSchema } from '@/common/validation/validate-schema';
import { VideoInfoResSchema, type VideoInfoRes } from './validation/VideoInfoResponseSchema';

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
    const videoUrl = dto.url;
    const baseURL = this.configService.get('YOUTUBE_BASE_URL');
    const key = this.configService.get('YOUTUBE_API_KEY');
    const videoId = dto.url.split('v=')[1];
    const videoInformationURL = `${baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${key}`;

    try {
      const [rawTranscript, videoInfoRes] = await Promise.all([
        YoutubeTranscript.fetchTranscript(videoUrl),
        firstValueFrom(this.httpService.get(videoInformationURL)).catch(() => ({
          data: [],
        })),
      ]);
      const formattedTranscript = this.formatTranscript(rawTranscript);
      const validatedVideoInfoRes = validateWithSchema(
        videoInfoRes.data,
        VideoInfoResSchema,
      );
      const formattedVideoInfo = this.formatVideoInfo(validatedVideoInfoRes);
      return {
        transcript: formattedTranscript,
        videoInfo: formattedVideoInfo,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error extracting video: ${errorMessage}`);
      return {
        transcript: [],
        videoInfo: null,
      };
    }
  }

  // HELPER
  formatTranscript(rawTranscript: TranscriptResponse[]): TranscriptItem[] {
    const formattedTranscript: TranscriptItem[] = [];

    const cleanText = (raw: string) =>
      raw
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .trim();

    const hasPunctuation = rawTranscript.some((item) =>
      /[.!?]/.test(item.text),
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
      const text = cleanText(item.text);
      if (!text) continue;

      const chunkEnd = item.offset + item.duration;

      if (!hasPunctuation) {
        if (groupText === '') groupStart = item.offset;
        groupText += (groupText ? ' ' : '') + text;
        groupDurationEnd = chunkEnd;

        const wordCount = groupText.split(/\s+/).length;
        if (wordCount >= 15) {
          flushGroup();
        }
        continue;
      }

      if (groupText === '') groupStart = item.offset;
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
