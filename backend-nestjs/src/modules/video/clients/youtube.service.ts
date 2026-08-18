import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { validateWithSchema } from '@/common/validation/validate-schema';
import {
  VideoInfoResSchema,
  type VideoInfoRes,
} from '../validation/VideoInfoResponseSchema';
import type { IVideoInfoProvider } from '../contracts/video-info-provider.interface';

@Injectable()
export class YoutubeService implements IVideoInfoProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getVideoInfo(videoId: string): Promise<VideoInfoRes> {
    const baseURL = this.configService.get('YOUTUBE_BASE_URL');
    const key = this.configService.get('YOUTUBE_API_KEY');
    const videoInformationURL = `${baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${key}`;

    const res = await firstValueFrom(this.httpService.get(videoInformationURL));

    if (res.data?.error) {
      throw new BadRequestException(
        `YouTube API error: ${JSON.stringify(res.data.error)}`,
      );
    }

    return validateWithSchema(res.data, VideoInfoResSchema);
  }
}
