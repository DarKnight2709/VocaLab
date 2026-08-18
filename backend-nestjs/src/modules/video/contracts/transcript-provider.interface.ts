import type { SerpApiTranscriptResponse } from '../validation/SerpApiTranscriptSchema';

export const TRANSCRIPT_PROVIDER = 'ITranscriptProvider';

export interface ITranscriptProvider {
  getTranscript(videoId: string): Promise<SerpApiTranscriptResponse>;
}
