import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { validateWithSchema } from '@/common/validation/validate-schema';
import {
  SerpApiTranscriptResponseSchema,
  type SerpApiTranscriptResponse,
} from '../validation/SerpApiTranscriptSchema';
import type { ITranscriptProvider } from '../contracts/transcript-provider.interface';

@Injectable()
export class SerpService implements ITranscriptProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getTranscript(videoId: string): Promise<SerpApiTranscriptResponse> {
    const serpApiBaseUrl = this.configService.get('SERPAPI_URL');
    const separator = serpApiBaseUrl.includes('?') ? '&' : '?';
    const transcriptURL = `${serpApiBaseUrl}${separator}engine=youtube_video_transcript&v=${videoId}&api_key=${this.configService.get('SERPAPI_API_KEY')}`;

    const res = await firstValueFrom(this.httpService.get(transcriptURL));

    if (res.data?.error) {
      throw new BadRequestException(
        `SerpAPI error: ${res.data.error}`,
      );
    }

    return validateWithSchema(res.data, SerpApiTranscriptResponseSchema);
  }
}
