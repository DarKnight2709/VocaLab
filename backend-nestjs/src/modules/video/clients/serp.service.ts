import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SerpService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getTranscript = async (videoId: string) => {
    const serpApiBaseUrl = this.configService.get('SERPAPI_URL');
    const separator = serpApiBaseUrl.includes('?') ? '&' : '?';
    const transcriptURL = `${serpApiBaseUrl}${separator}engine=youtube_video_transcript&v=${videoId}&api_key=${this.configService.get('SERPAPI_API_KEY')}`;
    return await firstValueFrom(this.httpService.get(transcriptURL));
  };
}
