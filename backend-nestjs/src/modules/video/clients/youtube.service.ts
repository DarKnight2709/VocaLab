import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YoutubeService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getVideoInfo = async (videoId: string) => {
    const baseURL = this.configService.get('YOUTUBE_BASE_URL');
    const key = this.configService.get('YOUTUBE_API_KEY');

    const videoInformationURL = `${baseURL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${key}`;
    return await firstValueFrom(this.httpService.get(videoInformationURL));
  };
}
